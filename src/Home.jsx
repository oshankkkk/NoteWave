import React, { useState } from "react";
import "./Home.css";

import SearchGroups from './SearchGroups';
import {auth} from './firebase-config';



function Home(){
const user = auth.currentUser;

   const nImages = 5;

 
    const [selectedImage, setSelectedImage] = useState(() => {
    const randIdx = Math.floor(Math.random() * nImages) + 1;
    return `/images/${randIdx}.png`; 
  });
    const [isVisible,setVisible]=useState(false);
    const toggleSidebar=()=>{
        setVisible(prev=>!prev);
    };
    const [showProfile,setProfile]=useState(false);
    const handleProfile=()=>{
        setProfile(prv=>!prv);
    };
    const [query, setQuery] = useState('');
   
    return(
       
        <div className="container">
          
           
            <div className="main-container" >
               
           
            <div className="main">
                
                <img id="greetingImg" src={selectedImage}></img>
            </div>
            
        </div>
        </div>
    );
}
export default Home;