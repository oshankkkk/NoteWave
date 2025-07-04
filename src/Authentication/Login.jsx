import { handleGoogleSignup } from "./AuthFunctions";
import { useNavigate } from "react-router-dom"; // ✅ import this

function LoginForm() {
  const navigate = useNavigate(); // ✅ hook for navigation

  return (
    <div className="min-h-screen  py-5 flex flex-col items-center justify-center" >
      <img src="/Images/Login-page/Loginbg.png" alt="Background image" className="absolute w-full h-full object-fill" />

      <div className=" bg-white  p-5 rounded-2xl h-full flex flex-col items-center justify-center z-10">
        <img src="public/Images/logo.png" alt="logo"></img>
        <div className="w-2/3 mt-3" >
          <h2 className="text-3xl font-semibold text-center mb-4">
            Let's Start Learning
          </h2>

          <h4 className="text-lg text-center mb-4">Please login to continue</h4>

          <button
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium"
          >
            {/* Google Icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              {/* SVG paths... */}
            </svg>
            Continue with Google
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don’t have an account?{" "}
              <a
                href="#"
                className="text-purple-600 font-medium transition-colors duration-200"
                onClick={() =>  // ✅ use navigate here
                  navigate("/signup")}

              >
                Sign up
              </a>
            </p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              By continuing, you agree to our{" "}
              <a href="#" className="text-purple-600">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-purple-600">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
