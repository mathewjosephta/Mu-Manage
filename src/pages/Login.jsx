import { useState }
from "react";

import { useNavigate }
from "react-router-dom";

import { supabase }
from "../services/supabase";

function Login() {

  const navigate =
    useNavigate();

  const [email,
    setEmail] =
      useState("");

  const [password,
    setPassword] =
      useState("");

  const [loading,
    setLoading] =
      useState(false);

  const handleLogin =
    async () => {

      const emailTrimmed = email.trim();
      const passwordTrimmed = password.trim();

      if (!emailTrimmed || !passwordTrimmed) {
        alert("Please enter both email and password.");
        return;
      }

      try {

        setLoading(true);

        const {
          data: loginData,
          error: loginError
        } = await supabase.auth
          .signInWithPassword({
            email: emailTrimmed,
            password: passwordTrimmed
          });

        if (loginError || !loginData?.user?.email) {
          console.log(loginError);
          alert(loginError?.message || "Login failed. Please check your credentials.");
          return;
        }

        const authEmail = loginData.user.email;

        const {
          data: userData,
          error: userError
        } = await supabase
          .from("users")
          .select("*")
          .eq("email", authEmail)
          .single();

        if (userError || !userData) {
          console.log(userError);
          alert("User data not found for this account.");
          return;
        }

        localStorage.setItem(
          "user",
          JSON.stringify({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            project_name: userData.project_name
          })
        );

        navigate("/daily-updates", { replace: true });

      }

      catch (err) {

        console.log(err);
        alert("Login failed");

      }

      finally {

        setLoading(false);

      }

    };

  return (

    <div className="min-h-screen flex items-center justify-center bg-[#f5f7fb]">

      <div className="bg-white p-10 rounded-3xl shadow-xl w-[400px]">

        <h1 className="text-4xl font-bold mb-2">

          μManage

        </h1>

        <p className="text-gray-500 mb-8">

          Login to continue

        </p>

        <div className="space-y-5">

          <input

            type="email"

            placeholder="Email"

            value={email}

            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }

            className="w-full border rounded-2xl px-4 py-3"

          />

          <input

            type="password"

            placeholder="Password"

            value={password}

            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }

            className="w-full border rounded-2xl px-4 py-3"

          />

          <button

            type="button"
            onClick={
              handleLogin
            }

            disabled={loading}

            className="w-full bg-blue-600 text-white py-3 rounded-2xl"

          >

            {

              loading

                ? "Logging in..."

                : "Login"

            }

          </button>

        </div>

      </div>

    </div>

  );

}

export default Login;