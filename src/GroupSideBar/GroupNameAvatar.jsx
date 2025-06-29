import { useState } from "react"
export default function GroupNameAndAvatar({groupData,adminId,name}){
const [isEditingName, setIsEditingName] = useState(false);
const [groupName, setGroupName] = useState(name);
   const handleNameSubmit = (e) => {
    if (e.key === 'Enter') {
      setIsEditingName(false);
    }
  };
  const handleNameEdit = () => {
    setIsEditingName(!isEditingName);
  };
    return(
        <div className="p-6 border-b bg-amber-50 border-gray-200">
          <div className="flex flex-col items-center">
            {/* Group Avatar */}
            <div className="relative mb-4">
              <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center text-4xl">
                👥
              </div>
              <button className="absolute bottom-2 right-2 bg-green-600 text-white p-2 rounded-full hover:bg-green-700">
                <span className="text-white text-lg">📷</span>
              </button>
            </div>

            {/* Group Name */}
            <div className="w-full">
              {isEditingName ? (
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  onKeyPress={handleNameSubmit}
                  onBlur={() => setIsEditingName(false)}
                  className="text-xl font-semibold text-center w-full border-b-2 border-green-600 outline-none bg-transparent"
                  autoFocus
                />
              ) : (
                <div className="flex items-center group">
                  <h3 className="text-xl font-semibold text-center">{groupName}</h3>
                  <span 
                    className="text-sm opacity-0 group-hover:opacity-100 cursor-pointer ml-2"
                    onClick={handleNameEdit}
                  >✏️</span>
                </div>
              )}
            </div>
            <div className="text-sm text-gray-500 mt-2 text-center">
              <p className="flex items-center justify-center">
                <span className="text-sm mr-1">👥</span>
                {/* {groupMembers.length}w members */}
                6
              </p>
              <p className="mt-1">
                {/* Created by {groupMembers.find(m => m.isCreator)?.name}, 12/15/2023 */}
              {adminId}
              </p>
            </div>
          </div>
        </div>
    )
}