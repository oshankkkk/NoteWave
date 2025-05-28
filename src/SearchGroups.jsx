import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import Fuse from 'fuse.js';
import './SearchGroups.css';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth} from "../firebase-config.js";

export default function SearchGroups({ query }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  console.log(query)
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      const fetchData = async () => {
        try {
          const snapshot = await getDocs(collection(db, "Group")); 
          const groupData = snapshot.docs.map(doc => ({
            id: doc.id,
            admin: doc.data().Admin,
            member_n: doc.data().Member,
            name: doc.data().Name,
            isPublic: doc.data().Public,
          }));
          setGroups(groupData);
        } catch (error) {
          console.log("fked up");
          console.error("Error fetching groups:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      console.log("User not authenticated");
      setLoading(false);
    }
  });

  return () => unsubscribe();
}, []);
  const fuse=new Fuse(groups,{
    keys:['name'],
    threshold:0.4,
  });
  const results=query? fuse.search(query).map(res=>res.item) : None;

  if (loading) return <p> <i class="fa-solid fa-spinner" style={{ marginLeft: '8px' }} id="spinner"></i> &nbsp;Loading groups...</p>;

  return (
  
    <div>
      
       
     
      {results.length === 0 && <p>No public groups found for your query.</p>}
      {results.filter(group => group.isPublic).map( group=> (
       
        <div
          key={group.id}
          onClick={() => console.log("Clicked group with id:", group.id)}
          style={{display:'inline', marginBottom: "1rem", cursor: "pointer",width:"100%",borderBottom:'1px solid #434343'
}}
          
        >
          
          <h3>{group.name} created by {group.admin}  &nbsp;&nbsp;<i  class="fa-solid fa-arrow-up-right-from-square" id="link"></i>  </h3>
        </div>
      ))}
    </div>
  );
};

