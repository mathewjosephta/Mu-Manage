import { useState } from "react";

import { useNavigate }
from "react-router-dom";

import { supabase }
from "../services/supabase";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleLogin = async () => {

    if (!email || !password) {

      alert("Fill all fields");

      return;

    }

    try {

      setLoading(true);

      // LOGIN USER

      const {

        data: loginData,

        error: loginError

      } = await supabase.auth
        .signInWithPassword({

          email,
          password

        });

      if (loginError) {

        alert(loginError.message);

        return;

      }

      console.log(loginData);

      // FETCH ROLE

      const {

        data: roleData,

        error: roleError

      } = await supabase
        .from("users")
        .select("role")
        .eq("email", email)
        .maybeSingle();

      console.log(roleData);
      console.log(roleError);

      if (!roleData) {

        alert("Role not found");

        return;

      }

      // ROLE REDIRECT

      if (roleData.role === "pm") {

        navigate("/dashboard");

      }

      else if (
        roleData.role === "lead"
      ) {

        navigate("/calendar");

      }

      else if (
        roleData.role === "member"
      ) {

        navigate("/calendar");

      }

      else {

        alert("Invalid role");

      }

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
          Agile Project Platform
        </p>

        <div className="space-y-5">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full border border-gray-200 bg-gray-50 rounded-2xl px-4 py-3"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full border border-gray-200 bg-gray-50 rounded-2xl px-4 py-3"
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-2xl font-semibold"
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