import {
  useEffect,
  useState
} from "react";

import { supabase }
from "../services/supabase";

function useNotifications() {

  const [notifications,
    setNotifications] =
      useState([]);

  const [loading,
    setLoading] =
      useState(true);

  const [unreadCount,
    setUnreadCount] =
      useState(0);

  // FETCH NOTIFICATIONS

  const fetchNotifications =
    async () => {

      try {

        setLoading(true);

        const {

          data,
          error

        } = await supabase

          .from(
            "notifications"
          )

          .select("*")

          .order(
            "created_at",
            {
              ascending: false
            }
          );

        if (error) {

          console.log(error);

          return;

        }

        setNotifications(
          data || []
        );

        const unread =

          data?.filter(
            (item) =>
              !item.is_read
          ).length || 0;

        setUnreadCount(
          unread
        );

      }

      catch (err) {

        console.log(err);

      }

      finally {

        setLoading(false);

      }

    };

  // MARK AS READ

  const markAsRead =
    async (id) => {

      try {

        await supabase

          .from(
            "notifications"
          )

          .update({

            is_read: true

          })

          .eq("id", id);

        fetchNotifications();

      }

      catch (err) {

        console.log(err);

      }

    };

  // MARK ALL AS READ

  const markAllAsRead =
    async () => {

      try {

        await supabase

          .from(
            "notifications"
          )

          .update({

            is_read: true

          })

          .eq(
            "is_read",
            false
          );

        fetchNotifications();

      }

      catch (err) {

        console.log(err);

      }

    };

  // DELETE NOTIFICATION

  const deleteNotification =
    async (id) => {

      try {

        await supabase

          .from(
            "notifications"
          )

          .delete()

          .eq("id", id);

        fetchNotifications();

      }

      catch (err) {

        console.log(err);

      }

    };

  // REALTIME

  useEffect(() => {

    fetchNotifications();

    const channel =
      supabase

        .channel(
          "notifications-live"
        )

        .on(

          "postgres_changes",

          {

            event: "*",

            schema: "public",

            table:
              "notifications"

          },

          () => {

            fetchNotifications();

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

    notifications,

    loading,

    unreadCount,

    fetchNotifications,

    markAsRead,

    markAllAsRead,

    deleteNotification

  };

}

export default useNotifications;