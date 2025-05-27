import { useState } from "react";
import { handleGoogleSignup } from "./AuthFunctions";
export default function AuthForm({formFunction,formAction}) {
  const [email, setEmail] = useState("");
  const[password, setPassword] = useState("");
 
  let altForm="Sign Up"
  let altFormLink=""
  let altFormTitle="Dont have a account?"
  if(formAction==="Sign Up"){
      altForm="Login"
      altFormLink=""
      altFormTitle="Already have a account?"
  }

function handleSubmit(e){
  e.preventDefault()
  }

  return (
    <>
      <div className=" bg-white  w-full rounded-2xl h-full flex flex-col items-center justify-center">
        <div className="w-2/3">
          <h2 className="text-3xl font-semibold text-center mb-4">
            lets start learning
          </h2>

          <h4 className="text-lg text-center mb-4">
            Please login or sign up to continue
          </h4>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-3 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-4 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-purple-600 text-white font-medium rounded-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              {formAction}
            </button>
          </form>

          <button
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium "
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {altFormTitle}{" "}
              <a
                href="#"
                className="text-purple-600  font-medium transition-colors duration-200"
              >
                {altForm}
              </a>
            </p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              By continuing, you agree to our{" "}
              <a href="#" className="text-purple-600 ">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-purple-600 ">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
