export default function MemberList({members}){
let groupMembers=Object.entries(members)
    return(

          <div className="space-y-1">
            {console.log(groupMembers)}
            {groupMembers.map((member) => (
              <div key={member[0]} className="flex items-center space-x-3 py-3 px-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                  {member.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900">{member[0]}</p>
                    {member.isCreator && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Creator
                      </span>
                    )}
                    {member.isAdmin && !member.isCreator && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{member.phone}</p>
                </div>
                {member.isAdmin && (
                  <span className="text-blue-600 text-sm">🛡️</span>
                )}
              </div>
            ))}
          </div>
        // </div>
    )
}