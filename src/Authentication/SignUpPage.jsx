import AuthForm from "./AuthForm";
import { handleEmailSignup } from "./AuthFunctions";

export default function SignUpPage(){

let formAction="Sign Up"
return(
    <div className="fixed  justify-center items-center min-h-screen ">

<AuthForm formAction={formAction} formFunction={handleEmailSignup}></AuthForm>
    </div>
)
}