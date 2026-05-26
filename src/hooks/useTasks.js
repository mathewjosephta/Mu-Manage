import {
  useEffect,
  useState
} from "react";

import { supabase }
from "../services/supabase";

function useTasks() {

  const [tasks,
    setTasks] =
      useState([]);

  const [loading,
    setLoading] =
      useState(true);

  const [error,
    setError] =
      useState(null);

  // FETCH TASKS

  const fetchTasks =
    async () => {

      try {

        setLoading(true);

        setError(null);

        const {

          data,
          error

        } = await supabase

          .from("tasks")

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

        setTasks(
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

  // ADD TASK

  const addTask =
    async (taskData) => {

      try {

        const {

          data,
          error

        } = await supabase

          .from("tasks")

          .insert([

            taskData

          ])

          .select();

        if (error) {

          console.log(error);

          return {

            success: false,
            error

          };

        }

        fetchTasks();

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

  // UPDATE TASK

  const updateTask =
    async (
      id,
      updatedData
    ) => {

      try {

        const {

          data,
          error

        } = await supabase

          .from("tasks")

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

        fetchTasks();

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

  // DELETE TASK

  const deleteTask =
    async (id) => {

      try {

        const {

          error

        } = await supabase

          .from("tasks")

          .delete()

          .eq("id", id);

        if (error) {

          console.log(error);

          return {

            success: false,
            error

          };

        }

        fetchTasks();

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

  // MOVE TASK STATUS

  const moveTask =
    async (
      id,
      status
    ) => {

      return await updateTask(
        id,
        { status }
      );

    };

  // MARK DONE

  const markTaskDone =
    async (id) => {

      return await updateTask(
        id,
        {
          status: "done"
        }
      );

    };

  // REALTIME

  useEffect(() => {

    fetchTasks();

    const channel =
      supabase

        .channel(
          "tasks-live"
        )

        .on(

          "postgres_changes",

          {

            event: "*",

            schema: "public",

            table: "tasks"

          },

          () => {

            fetchTasks();

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

    tasks,

    loading,

    error,

    fetchTasks,

    addTask,

    updateTask,

    deleteTask,

    moveTask,

    markTaskDone

  };

}

export default useTasks;