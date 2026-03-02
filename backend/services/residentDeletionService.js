const mongoose = require('mongoose');
const User = require('../models/User');
const FamilyMember = require('../models/FamilyMember');
const Vehicle = require('../models/Vehicle');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const DeletionAudit = require('../models/DeletionAudit');
const { createNotificationInternal } = require('../controllers/notificationController');

const DELETION_SOURCES = ['manual', 'property_sale', 'tenant_move_out', 'system'];

const sanitizeReason = (reason) => reason && reason.trim();

const withSession = (query, session) => (session ? query.session(session) : query);

const runDeletionCascade = async ({
  resident,
  performedBy,
  normalizedReason,
  source,
  metadata,
  session
}) => {
  const now = new Date();

  const [familyResult, vehicleResult, complaintResult, notificationResult] = await Promise.all([
    withSession(
      FamilyMember.updateMany(
        { userId: resident._id, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: now, deletedBy: performedBy } }
      ),
      session
    ),
    withSession(
      Vehicle.updateMany(
        { userId: resident._id, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: now, deletedBy: performedBy } }
      ),
      session
    ),
    withSession(
      Complaint.updateMany(
        { userId: resident._id, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: now, deletedBy: performedBy } }
      ),
      session
    ),
    withSession(
      Notification.updateMany(
        { userId: resident._id, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: now, deletedBy: performedBy } }
      ),
      session
    )
  ]);

  const cascadeCounts = {
    familyMembers: familyResult.modifiedCount || 0,
    vehicles: vehicleResult.modifiedCount || 0,
    complaints: complaintResult.modifiedCount || 0,
    notifications: notificationResult.modifiedCount || 0
  };

  const residentSnapshot = {
    fullName: resident.fullName,
    email: resident.email,
    wing: resident.wing,
    flatNumber: resident.flatNumber,
    residentType: resident.residentType,
    status: resident.status,
    phoneNumber: resident.phoneNumber,
    createdAt: resident.createdAt,
    familyCount: cascadeCounts.familyMembers,
    vehicleCount: cascadeCounts.vehicles,
    complaintCount: cascadeCounts.complaints
  };

  const updateOptions = {
    new: true,
    runValidators: true,
    ...(session && { session })
  };

  const updatedResident = await User.findByIdAndUpdate(
    resident._id,
    {
      $set: {
        isDeleted: true,
        status: 'deleted',
        deletedAt: now,
        deletedBy: performedBy,
        deletionReason: normalizedReason,
        deletionSource: source,
        familyMembers: [],
        vehicles: [],
        complaints: []
      },
      $inc: { sessionVersion: 1 }
    },
    updateOptions
  );

  const auditPayload = [{
    residentId: updatedResident._id,
    performedBy,
    reason: normalizedReason,
    source,
    residentSnapshot,
    cascadeCounts,
    forcedLogout: true,
    metadata
  }];

  const auditRecord = await DeletionAudit.create(
    auditPayload,
    session ? { session } : undefined
  );

  return { cascadeCounts, auditRecord };
};

const deleteWithTransaction = async (params) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const residentQuery = withSession(
      User.findOne({
        _id: params.residentId,
        role: 'resident',
        isDeleted: false
      }),
      session
    );

    const resident = await residentQuery;

    if (!resident) {
      throw new Error('Resident not found or already deleted');
    }

    const result = await runDeletionCascade({
      resident,
      session,
      ...params
    });

    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const deleteWithoutTransaction = async (params) => {
  const resident = await User.findOne({
    _id: params.residentId,
    role: 'resident',
    isDeleted: false
  });

  if (!resident) {
    throw new Error('Resident not found or already deleted');
  }

  return runDeletionCascade({
    resident,
    session: null,
    ...params
  });
};

const deleteResidentAccount = async ({
  residentId,
  performedBy,
  reason,
  source = 'manual',
  metadata = {}
}) => {
  const normalizedReason = sanitizeReason(reason);

  if (!normalizedReason) {
    throw new Error('Deletion reason is required');
  }

  if (!DELETION_SOURCES.includes(source)) {
    throw new Error('Invalid deletion source provided');
  }

  let deletionResult;

  try {
    deletionResult = await deleteWithTransaction({
      residentId,
      performedBy,
      normalizedReason,
      source,
      metadata
    });
  } catch (error) {
    if (error?.message?.includes('Transaction numbers are only allowed')) {
      console.warn('MongoDB transactions unsupported in current environment. Retrying without transaction.');
      deletionResult = await deleteWithoutTransaction({
        residentId,
        performedBy,
        normalizedReason,
        source,
        metadata
      });
    } else {
      throw error;
    }
  }

  const notificationIds = [];

  try {
    const notification = await createNotificationInternal({
      userId: residentId,
      title: 'Account Deleted',
      message: `Your resident account has been deleted by the admin. Reason: ${normalizedReason}`,
      type: 'warning',
      relatedModel: 'User',
      relatedId: residentId
    });
    if (notification?._id) {
      notificationIds.push(notification._id);
    }
  } catch (notificationError) {
    console.error('Failed to send deletion notification to resident:', notificationError.message);
  }

  if (notificationIds.length && deletionResult.auditRecord?.[0]?._id) {
    await DeletionAudit.findByIdAndUpdate(deletionResult.auditRecord[0]._id, {
      $set: { notificationIds }
    });
  }

  return {
    auditId: deletionResult.auditRecord?.[0]?._id,
    cascadeCounts: deletionResult.cascadeCounts,
    forcedLogout: true,
    source
  };
};

module.exports = {
  deleteResidentAccount
};

