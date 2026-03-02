const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.ts')) results.push(file);
        }
    });
    return results;
}

const files = walk('./src/app/pages');

let changedCount = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Fix environments
    content = content.replace(/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/environments\/environment/g, '../../../../environments/environment');
    
    // Fix shared components
    content = content.replace(/\.\.\/\.\.\/\.\.\/\.\.\/shared\//g, '../../../shared/');
    
    // Fix dashboard services (only dash needs it usually)
    content = content.replace(/\.\.\/\.\.\/\.\.\/\.\.\/core\/services/g, '../../../core/services');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changedCount++;
        console.log(`Updated ${file}`);
    }
});
console.log(`Total files updated: ${changedCount}`);
