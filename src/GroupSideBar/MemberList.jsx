import { db } from "../firebase-config"
import Member from "./Member"

export default function MemberList({members, adminId}){
let groupMembers=Object.entries(members)
    return(

          <div className="space-y-1">
            {console.log(groupMembers)}
            {groupMembers.map((member) => (
<Member  memberID={member[0]} adminId={adminId}></Member>            
            ))}
          </div>
        // </div>
    )
}