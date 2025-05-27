import { useState } from "react";
import AuthForm from "./AuthForm";
import { handleEmailLogin } from "./AuthFunctions";

function LoginForm() {
let formAction="Sign Up"
  return (
    <div className="min-h-screen fixed inset-y-0 py-5  right-3 w-[30%] flex flex-col items-center justify-center bg-purple-600"> 
            <AuthForm formFunction={handleEmailLogin} formAction={formAction}></AuthForm>
            </div>
  );
}
export default LoginForm;
