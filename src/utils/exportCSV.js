import * as XLSX
from "xlsx";

// EXPORT JSON TO EXCEL

export const exportCSV =
  (
    data = [],
    fileName = "export"
  ) => {

    try {

      if (!data.length) {

        alert(
          "No data available"
        );

        return;

      }

      // CREATE WORKSHEET

      const worksheet =
        XLSX.utils.json_to_sheet(
          data
        );

      // CREATE WORKBOOK

      const workbook =
        XLSX.utils.book_new();

      // APPEND

      XLSX.utils.book_append_sheet(

        workbook,

        worksheet,

        "Data"

      );

      // EXPORT FILE

      XLSX.writeFile(

        workbook,

        `${fileName}.xlsx`

      );

    }

    catch (err) {

      console.log(err);

      alert(
        "Export failed"
      );

    }

  };

// EXPORT TASKS

export const exportTasks =
  (tasks = []) => {

    const formatted =
      tasks.map(
        (task) => ({

          Title:
            task.title,

          Description:
            task.description,

          Status:
            task.status,

          Priority:
            task.priority,

          Assignee:
            task.assigned_to,

          Team:
            task.team_name,

          Due_Date:
            task.due_date,

          Created_At:
            task.created_at

        })
      );

    exportCSV(
      formatted,
      "tasks"
    );

  };

// EXPORT PROJECTS

export const exportProjects =
  (projects = []) => {

    const formatted =
      projects.map(
        (project) => ({

          Name:
            project.name,

          Description:
            project.description,

          Team:
            project.team_name,

          Tech_Stack:
            project.tech_stack,

          Status:
            project.status,

          Created_At:
            project.created_at

        })
      );

    exportCSV(
      formatted,
      "projects"
    );

  };

// EXPORT DAILY UPDATES

export const exportDailyUpdates =
  (updates = []) => {

    const formatted =
      updates.map(
        (update) => ({

          Name:
            update.user_name,

          Team:
            update.team_name,

          Completed:
            update.completed_today,

          Blockers:
            update.blockers,

          Tomorrow:
            update.tomorrow_goals,

          Created_At:
            update.created_at

        })
      );

    exportCSV(
      formatted,
      "daily_updates"
    );

  };

// EXPORT LINKEDIN UPDATES

export const exportLinkedinUpdates =
  (updates = []) => {

    const formatted =
      updates.map(
        (update) => ({

          Name:
            update.user_name,

          Team:
            update.team_name,

          Linkedin_URL:
            update.linkedin_url,

          Demo_Link:
            update.demo_link,

          Challenges:
            update.challenges,

          Tagged_Foundation:
            update.tagged_foundation,

          Tagged_ASIET:
            update.tagged_asiet,

          Created_At:
            update.created_at

        })
      );

    exportCSV(
      formatted,
      "linkedin_updates"
    );

  };