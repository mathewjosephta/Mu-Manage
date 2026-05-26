import {
  useEffect,
  useRef
} from "react";

import { supabase }
from "../services/supabase";

function useRealtime({

  table,

  event = "*",

  callback,

  schema = "public"

}) {

  const channelRef =
    useRef(null);

  useEffect(() => {

    // VALIDATION

    if (!table) {

      console.log(
        "Realtime table missing"
      );

      return;

    }

    if (!callback) {

      console.log(
        "Realtime callback missing"
      );

      return;

    }

    // CREATE CHANNEL

    const channel =
      supabase

        .channel(

          `${table}-realtime`

        )

        .on(

          "postgres_changes",

          {

            event,
            schema,
            table

          },

          (payload) => {

            console.log(
              "Realtime Update:",
              payload
            );

            callback(payload);

          }

        )

        .subscribe(

          (status) => {

            console.log(

              `${table} realtime:`,

              status

            );

          }

        );

    channelRef.current =
      channel;

    // CLEANUP

    return () => {

      if (
        channelRef.current
      ) {

        supabase.removeChannel(

          channelRef.current

        );

      }

    };

  }, [

    table,
    event,
    schema,
    callback

  ]);

}

export default useRealtime;