const express = require('express');
const router = express.Router();
const {
  addFamilyMember,
  getFamilyMembers,
  getFamilyMember,
  updateFamilyMember,
  deleteFamilyMember
} = require('../controllers/familyController');
const { authenticateToken } = require('../middlewares/auth');
const { validateFamilyMember, validateObjectId } = require('../middlewares/validation');

// All family routes require authentication
router.use(authenticateToken);

router.post('/', validateFamilyMember, addFamilyMember);
router.get('/', getFamilyMembers);
router.get('/:memberId', validateObjectId('memberId'), getFamilyMember);
router.put('/:memberId', validateObjectId('memberId'), validateFamilyMember, updateFamilyMember);
router.delete('/:memberId', validateObjectId('memberId'), deleteFamilyMember);

module.exports = router;
