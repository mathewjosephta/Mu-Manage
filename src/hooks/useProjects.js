import {
  useEffect,
  useState
} from "react";

import { supabase }
from "../services/supabase";

function useProjects() {

  const [projects,
    setProjects] =
      useState([]);

  const [loading,
    setLoading] =
      useState(true);

  const [error,
    setError] =
      useState(null);

  // FETCH PROJECTS

  const fetchProjects =
    async () => {

      try {

        setLoading(true);

        setError(null);

        const {

          data,
          error

        } = await supabase

          .from("projects")

          .select("*")

          .order(
            "created_at",
            {
              ascending: false
            }
          );

        if (error) {

          console.log(error);

          setError(error);

          return;

        }

        setProjects(
          data || []
        );

      }

      catch (err) {

        console.log(err);

        setError(err);

      }

      finally {

        setLoading(false);

      }

    };

  // ADD PROJECT

  const addProject =
    async (projectData) => {

      try {

        const {

          data,
          error

        } = await supabase

          .from("projects")

          .insert([

            projectData

          ])

          .select();

        if (error) {

          console.log(error);

          return {

            success: false,
            error

          };

        }

        fetchProjects();

        return {

          success: true,
          data

        };

      }

      catch (err) {

        console.log(err);

        return {

          success: false,
          error: err

        };

      }

    };

  // UPDATE PROJECT

  const updateProject =
    async (
      id,
      updatedData
    ) => {

      try {

        const {

          data,
          error

        } = await supabase

          .from("projects")

          .update(
            updatedData
          )

          .eq("id", id)

          .select();

        if (error) {

          console.log(error);

          return {

            success: false,
            error

          };

        }

        fetchProjects();

        return {

          success: true,
          data

        };

      }

      catch (err) {

        console.log(err);

        return {

          success: false,
          error: err

        };

      }

    };

  // DELETE PROJECT

  const deleteProject =
    async (id) => {

      try {

        const {

          error

        } = await supabase

          .from("projects")

          .delete()

          .eq("id", id);

        if (error) {

          console.log(error);

          return {

            success: false,
            error

          };

        }

        fetchProjects();

        return {

          success: true

        };

      }

      catch (err) {

        console.log(err);

        return {

          success: false,
          error: err

        };

      }

    };

  // REALTIME

  useEffect(() => {

    fetchProjects();

    const channel =
      supabase

        .channel(
          "projects-live"
        )

        .on(

          "postgres_changes",

          {

            event: "*",

            schema: "public",

            table: "projects"

          },

          () => {

            fetchProjects();

          }

        )

        .subscribe();

    return () => {

      supabase.removeChannel(
        channel
      );

    };

  }, []);

  return {

    projects,

    loading,

    error,

    fetchProjects,

    addProject,

    updateProject,

    deleteProject

  };

}

export default useProjects;