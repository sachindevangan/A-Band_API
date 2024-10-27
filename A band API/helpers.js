// You can add and export any helper functions you want here - if you aren't using any, then you can just leave this file as is

export const compareAndUpdate = (newDoc, oldDoc) => {
    const oldDocKeys = Object.keys(oldDoc);
    const newDocKeys = Object.keys(newDoc);
  
    if (oldDocKeys.length !== newDocKeys.length) {
      return false;
    }
  
    for (let key of oldDocKeys) {
      if (!newDoc.hasOwnProperty(key)) {
        return false;
      }
  
      if (key === 'genre' || key === 'groupMembers') {
        const oldArray = oldDoc[key];
        const newArray = newDoc[key];
  
        if (oldArray.length !== newArray.length) {
          return false;
        }
  
        for (let i = 0; i < oldArray.length; i++) {
          if (oldArray[i] !== newArray[i]) {
            return false;
          }
        }
      } else if (key === 'name' || key === 'recordCompany' || key === 'website' || key === 'yearBandWasFormed') {
        if (newDoc[key] !== oldDoc[key]) {
          return false;
        }
      }
    }
  
    return true;
  };
  