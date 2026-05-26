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

        // LOGIN

        const {

          data: loginData,

          error: loginError

        } = await supabase.auth
          .signInWithPassword({

            email,
            password

          });

        if (loginError) {

          console.log(
            loginError
          );

          alert(
            loginError.message
          );

          return;

        }

        console.log(
          "LOGIN SUCCESS"
        );

        console.log(
          loginData
        );

        // FETCH USER DATA

        const {

          data: roleData,

          error: roleError

        } = await supabase

          .from("users")

          .select("*")

          .eq("email", email)

          .single();

        console.log(
          "ROLE DATA"
        );

        console.log(
          roleData
        );

        console.log(
          "ROLE ERROR"
        );

        console.log(
          roleError
        );

        if (
          roleError ||
          !roleData
        ) {

          alert(
            "No user role found"
          );

          return;

        }

        // SAVE FULL USER

        localStorage.setItem(

          "user",

          JSON.stringify({

            id:
              roleData.id,

            name:
              roleData.name,

            email:
              roleData.email,

            role:
              roleData.role,

            team_name:
              roleData.team_name

          })

        );

        console.log(
          "ROLE:"
        );

        console.log(
          roleData.role
        );

        // REDIRECT

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

          Agile Project Platform

        </p>

        <div className="space-y-5">

          {/* EMAIL */}

          <input

            type="email"

            placeholder="Email"

            value={email}

            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }

            className="w-full border border-gray-200 bg-gray-50 rounded-2xl px-4 py-3 outline-none"

          />

          {/* PASSWORD */}

          <input

            type="password"

            placeholder="Password"

            value={password}

            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }

            className="w-full border border-gray-200 bg-gray-50 rounded-2xl px-4 py-3 outline-none"

          />

          {/* BUTTON */}

          <button

            onClick={
              handleLogin
            }

            disabled={loading}

            className="w-full bg-blue-600 hover:bg-blue-700 transition-all text-white py-3 rounded-2xl font-semibold"

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