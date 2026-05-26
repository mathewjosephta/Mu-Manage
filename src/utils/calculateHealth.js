function calculateHealth(tasks = []) {

  // EMPTY

  if (!tasks.length) {

    return {

      score: 0,

      status: "No Tasks",

      color: "gray"

    };

  }

  // COUNTS

  const totalTasks =
    tasks.length;

  const completedTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "done"
    ).length;

  const reviewTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "under review"
    ).length;

  const inProgressTasks =
    tasks.filter(
      (task) =>
        task.status ===
        "in progress"
    ).length;

  const overdueTasks =
    tasks.filter(
      (task) => {

        if (
          task.status ===
          "done"
        ) {

          return false;

        }

        if (
          !task.due_date
        ) {

          return false;

        }

        return (

          new Date(
            task.due_date
          ) < new Date()

        );

      }
    ).length;

  // SCORE

  let score = 0;

  // COMPLETED

  score +=
    (
      completedTasks /
      totalTasks
    ) * 60;

  // REVIEW

  score +=
    (
      reviewTasks /
      totalTasks
    ) * 20;

  // IN PROGRESS

  score +=
    (
      inProgressTasks /
      totalTasks
    ) * 10;

  // OVERDUE PENALTY

  score -=
    (
      overdueTasks /
      totalTasks
    ) * 30;

  // LIMIT

  score = Math.max(
    0,
    Math.min(
      100,
      Math.round(score)
    )
  );

  // STATUS

  let status =
    "Critical";

  let color =
    "red";

  if (score >= 85) {

    status =
      "Excellent";

    color =
      "green";

  }

  else if (
    score >= 70
  ) {

    status =
      "Healthy";

    color =
      "blue";

  }

  else if (
    score >= 50
  ) {

    status =
      "Moderate";

    color =
      "yellow";

  }

  else if (
    score >= 30
  ) {

    status =
      "Risk";

    color =
      "orange";

  }

  return {

    score,

    status,

    color,

    stats: {

      totalTasks,

      completedTasks,

      reviewTasks,

      inProgressTasks,

      overdueTasks

    }

  };

}

export default calculateHealth;