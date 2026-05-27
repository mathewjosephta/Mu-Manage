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

      try {

        setLoading(true);

        const {

          data: loginData,

          error: loginError

        } = await supabase.auth
          .signInWithPassword({

            email:
              email.trim(),

            password:
              password.trim()

          });

        // LOGIN ERROR

        if (loginError) {

          console.log(
            loginError
          );

          alert(
            loginError.message
          );

          return;

        }

        // DEBUG

        console.log(
          "AUTH EMAIL:"
        );

        console.log(
          loginData.user.email
        );

        console.log(
          "INPUT EMAIL:"
        );

        console.log(
          email.trim()
        );

        // FETCH USER

        const {

          data: userData,

          error: userError

        } = await supabase

          .from("users")

          .select("*")

          .eq(
            "email",
            loginData.user.email
          )

          .single();

        console.log(
          "USER DATA:"
        );

        console.log(
          userData
        );

        console.log(
          "USER ERROR:"
        );

        console.log(
          userError
        );

        if (
          userError ||
          !userData
        ) {

          alert(
            "User data not found"
          );

          return;

        }

        // SAVE USER

        localStorage.setItem(

          "user",

          JSON.stringify({

            id:
              userData.id,

            name:
              userData.name,

            email:
              userData.email,

            role:
              userData.role,

            project_name:
              userData.project_name

          })

        );

        navigate("/");

      }

      catch (err) {

        console.log(err);

        alert(
          "Login failed"
        );

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