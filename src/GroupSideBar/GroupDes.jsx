import { useState } from "react";
export default function GroupDescription({description}){
    const [groupDescription, setGroupDescription] = useState(description);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
 const handleDescriptionEdit = () => {
    setIsEditingDescription(!isEditingDescription);
  };
    const handleDescriptionSubmit = (e) => {
    if (e.key === 'Enter') {
      setIsEditingDescription(false);
    }
  };
    return(
         <div className="p-4 border-b border-gray-200">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Description</h4>
            <span 
              className="text-sm text-gray-500 cursor-pointer hover:text-gray-700"
              onClick={handleDescriptionEdit}
              >✏️</span>
          </div>
          {isEditingDescription ? (
            <textarea
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              onKeyPress={handleDescriptionSubmit}
              onBlur={() => setIsEditingDescription(false)}
              className="w-full text-sm text-gray-600 border border-gray-300 rounded p-2 outline-none focus:border-green-600 resize-none"
              rows="3"
              autoFocus
            />
          ) : (
            <p className="text-sm text-gray-600">{groupDescription}</p>
          )}
        </div>
    )
}