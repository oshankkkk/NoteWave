// src/components/AddGroups.jsx
import React, { useState } from "react";
import { db } from "./firebase";
import {  updateDoc, arrayUnion ,doc} from "firebase/firestore";

async function joinPublic(user, groupId) {
  if (!user || !user.uid) {
    console.error("User is not authenticated");
    return;
  }

  try {
    const userRef = doc(db, "User", user.uid);
    await updateDoc(userRef, {
      groupIds: arrayUnion(groupId),
    });
    console.log("Group added to user successfully");
  } catch (error) {
    console.error("Failed to add group to user:", error);
  }
}


//function joinPrivate(){}
export {joinPublic};
