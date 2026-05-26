// ROLE CHECKS

export const isProjectManager =
  (user) => {

    return (
      user?.role === "pm"
    );

  };

export const isTeamLead =
  (user) => {

    return (
      user?.role === "lead"
    );

  };

export const isMember =
  (user) => {

    return (
      user?.role === "member"
    );

  };

// TASK PERMISSIONS

export const canCreateTask =
  (user) => {

    return (

      isProjectManager(user) ||

      isTeamLead(user)

    );

  };

export const canEditTask =
  (
    user,
    task
  ) => {

    if (!user || !task)
      return false;

    // PM CAN EDIT ALL

    if (
      isProjectManager(user)
    ) {

      return true;

    }

    // LEAD CAN EDIT TEAM TASKS

    if (

      isTeamLead(user) &&

      user.team_name ===
      task.team_name

    ) {

      return true;

    }

    // MEMBER CAN EDIT OWN TASK

    return (

      isMember(user) &&

      task.assigned_to ===
      user.email

    );

  };

export const canDeleteTask =
  (
    user,
    task
  ) => {

    if (!user || !task)
      return false;

    // PM

    if (
      isProjectManager(user)
    ) {

      return true;

    }

    // LEAD

    return (

      isTeamLead(user) &&

      task.created_by ===
      user.email

    );

  };

export const canMoveTask =
  (
    user,
    task,
    nextStatus
  ) => {

    if (!user || !task)
      return false;

    // PM

    if (
      isProjectManager(user)
    ) {

      return true;

    }

    // LEAD

    if (
      isTeamLead(user)
    ) {

      return true;

    }

    // MEMBER RULES

    if (
      isMember(user)
    ) {

      // MEMBERS CANNOT MOVE TO DONE

      if (
        nextStatus === "done"
      ) {

        return false;

      }

      // MEMBERS CAN ONLY MOVE OWN TASKS

      return (

        task.assigned_to ===
        user.email

      );

    }

    return false;

  };

// PROJECT PERMISSIONS

export const canManageProjects =
  (user) => {

    return (
      isProjectManager(user)
    );

  };

export const canDeleteProject =
  (user) => {

    return (
      isProjectManager(user)
    );

  };

export const canEditProject =
  (user) => {

    return (
      isProjectManager(user)
    );

  };

// USER MANAGEMENT

export const canManageUsers =
  (user) => {

    return (
      isProjectManager(user)
    );

  };

// DAILY UPDATES

export const canSubmitDailyUpdate =
  (user) => {

    return !!user;

  };

export const canViewAllDailyUpdates =
  (user) => {

    return (

      isProjectManager(user) ||

      isTeamLead(user)

    );

  };

// LINKEDIN UPDATES

export const canSubmitLinkedinUpdate =
  (user) => {

    return !!user;

  };

export const canExportLinkedinUpdates =
  (user) => {

    return (
      isProjectManager(user)
    );

  };

// CHAT

export const canUseTeamChat =
  (user) => {

    return !!user;

  };

// DASHBOARD

export const canViewDashboard =
  (user) => {

    return !!user;

  };

// ROLE LABEL

export const getRoleLabel =
  (role) => {

    switch (role) {

      case "pm":

        return "Project Manager";

      case "lead":

        return "Team Lead";

      case "member":

        return "Team Member";

      default:

        return "Unknown";

    }

  };

// STATUS COLOR

export const getStatusColor =
  (status) => {

    switch (status) {

      case "todo":

        return "bg-gray-200";

      case "in progress":

        return "bg-blue-200";

      case "under review":

        return "bg-yellow-200";

      case "done":

        return "bg-green-200";

      default:

        return "bg-gray-100";

    }

  };