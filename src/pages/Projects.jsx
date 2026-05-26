import {
  useEffect,
  useState
} from "react";

import {

  Plus,
  Pencil,
  Trash2,
  Users,
  Calendar,
  Code2,
  FolderKanban,
  Search,
  X

} from "lucide-react";

import { supabase }
from "../services/supabase";

import ProjectCard
from "../components/ProjectCard";

function Projects() {

  const [projects,
    setProjects] =
      useState([]);

  const [tasks,
    setTasks] =
      useState([]);

  const [users,
    setUsers] =
      useState([]);

  const [loading,
    setLoading] =
      useState(true);

  const [search,
    setSearch] =
      useState("");

  const [selectedProject,
    setSelectedProject] =
      useState(null);

  const [showModal,
    setShowModal] =
      useState(false);

  const [editing,
    setEditing] =
      useState(false);

  // FORM

  const [name,
    setName] =
      useState("");

  const [description,
    setDescription] =
      useState("");

  const [techStack,
    setTechStack] =
      useState("");

  const [deadline,
    setDeadline] =
      useState("");

  const [color,
    setColor] =
      useState("#dcecff");

  // FETCH

  useEffect(() => {

    fetchProjects();

  }, []);

  const fetchProjects =
    async () => {

      setLoading(true);

      const {

        data: projectData

      } = await supabase

        .from("projects")

        .select("*")

        .order(
          "created_at",
          {
            ascending: false
          }
        );

      const {

        data: taskData

      } = await supabase

        .from("tasks")

        .select("*");

      const {

        data: userData

      } = await supabase

        .from("users")

        .select("*");

      setProjects(
        projectData || []
      );

      setTasks(
        taskData || []
      );

      setUsers(
        userData || []
      );

      setLoading(false);

    };

  // RESET

  const resetForm =
    () => {

      setName("");

      setDescription("");

      setTechStack("");

      setDeadline("");

      setColor("#dcecff");

      setEditing(false);

      setSelectedProject(null);

    };

  // CREATE

  const createProject =
    async () => {

      if (
        !name ||
        !deadline
      ) return;

      await supabase

        .from("projects")

        .insert([{

          name,

          description,

          tech_stack:
            techStack,

          deadline,

          color

        }]);

      closeModal();

      fetchProjects();

    };

  // UPDATE

  const updateProject =
    async () => {

      await supabase

        .from("projects")

        .update({

          name,

          description,

          tech_stack:
            techStack,

          deadline,

          color

        })

        .eq(
          "id",
          selectedProject.id
        );

      closeModal();

      fetchProjects();

    };

  // DELETE

  const deleteProject =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "Delete this project?"
        );

      if (!confirmDelete)
        return;

      await supabase

        .from("projects")

        .delete()

        .eq("id", id);

      fetchProjects();

    };

  // EDIT

  const openEdit =
    (project) => {

      setEditing(true);

      setSelectedProject(
        project
      );

      setName(
        project.name
      );

      setDescription(
        project.description
      );

      setTechStack(
        project.tech_stack
      );

      setDeadline(
        project.deadline
      );

      setColor(
        project.color
      );

      setShowModal(true);

    };

  // CLOSE

  const closeModal =
    () => {

      setShowModal(false);

      resetForm();

    };

  // FILTER

  const filteredProjects =
    projects.filter(
      (project) =>

        project.name
          ?.toLowerCase()

          .includes(
            search.toLowerCase()
          )
    );

  // LOADING

  if (loading) {

    return (

      <div className="h-screen bg-[#f7f3ea] flex items-center justify-center">

        <h1 className="text-5xl font-black text-[#1d2b53]">

          Loading Projects...

        </h1>

      </div>

    );

  }

  return (

    <div className="min-h-screen bg-[#f7f3ea] p-8">

      {/* HEADER */}

      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">

        <div>

          <h1 className="text-6xl font-black text-[#1d2b53]">

            Projects

          </h1>

          <p className="text-[#5c6b8a] mt-3 text-xl">

            Manage projects, teams & sprint workflows

          </p>

        </div>

        {/* RIGHT */}

        <div className="flex flex-col md:flex-row gap-4">

          {/* SEARCH */}

          <div className="flex items-center gap-3 bg-white border-[4px] border-[#1d2b53] rounded-[24px] px-5 py-4 shadow-[4px_4px_0px_#1d2b53]">

            <Search
              size={22}
              className="text-[#5c6b8a]"
            />

            <input

              type="text"

              placeholder="Search project..."

              value={search}

              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }

              className="bg-transparent outline-none text-[#1d2b53] font-semibold w-[220px]"

            />

          </div>

          {/* CREATE */}

          <button

            onClick={() =>
              setShowModal(true)
            }

            className="flex items-center gap-3 bg-[#3b82f6] text-white px-7 py-4 rounded-[24px] border-[4px] border-[#1d2b53] shadow-[5px_5px_0px_#1d2b53] font-black text-lg hover:translate-y-[2px] transition-all"

          >

            <Plus size={24} />

            Create Project

          </button>

        </div>

      </div>

      {/* OVERVIEW */}

      <div className="grid md:grid-cols-3 gap-6 mb-8">

        {/* TOTAL */}

        <div className="bg-[#dcecff] border-[4px] border-[#1d2b53] rounded-[30px] p-7 shadow-[5px_5px_0px_#1d2b53]">

          <div className="flex items-center justify-between mb-5">

            <FolderKanban
              size={34}
              className="text-[#1d2b53]"
            />

            <div className="bg-white border-[3px] border-[#1d2b53] rounded-full px-4 py-2 text-sm font-black">

              Projects

            </div>

          </div>

          <h2 className="text-6xl font-black text-[#1d2b53]">

            {
              projects.length
            }

          </h2>

        </div>

        {/* TASKS */}

        <div className="bg-[#fff5b8] border-[4px] border-[#1d2b53] rounded-[30px] p-7 shadow-[5px_5px_0px_#1d2b53]">

          <div className="flex items-center justify-between mb-5">

            <Code2
              size={34}
              className="text-[#1d2b53]"
            />

            <div className="bg-white border-[3px] border-[#1d2b53] rounded-full px-4 py-2 text-sm font-black">

              Tasks

            </div>

          </div>

          <h2 className="text-6xl font-black text-[#1d2b53]">

            {
              tasks.filter(
                (task) =>
                  !task.is_deleted
              ).length
            }

          </h2>

        </div>

        {/* USERS */}

        <div className="bg-[#d8f7df] border-[4px] border-[#1d2b53] rounded-[30px] p-7 shadow-[5px_5px_0px_#1d2b53]">

          <div className="flex items-center justify-between mb-5">

            <Users
              size={34}
              className="text-[#1d2b53]"
            />

            <div className="bg-white border-[3px] border-[#1d2b53] rounded-full px-4 py-2 text-sm font-black">

              Members

            </div>

          </div>

          <h2 className="text-6xl font-black text-[#1d2b53]">

            {
              users.length
            }

          </h2>

        </div>

      </div>

      {/* PROJECTS */}

      {

        filteredProjects.length === 0 ? (

          <div className="bg-white border-[4px] border-[#1d2b53] rounded-[34px] p-14 text-center shadow-[6px_6px_0px_#1d2b53]">

            <FolderKanban
              size={50}
              className="mx-auto text-[#5c6b8a]"
            />

            <h2 className="text-4xl font-black text-[#1d2b53] mt-6">

              No Projects Found

            </h2>

          </div>

        ) : (

          <div className="grid xl:grid-cols-2 gap-7">

            {

              filteredProjects.map(
                (project) => (

                  <div
                    key={
                      project.id
                    }

                    className="relative"
                  >

                    {/* CARD */}

                    <ProjectCard

                      project={
                        project
                      }

                      tasks={
                        tasks
                      }

                      users={
                        users
                      }

                      onClick={() =>
                        setSelectedProject(
                          project
                        )
                      }

                    />

                    {/* ACTIONS */}

                    <div className="absolute top-6 right-6 flex gap-3">

                      {/* EDIT */}

                      <button

                        onClick={() =>
                          openEdit(
                            project
                          )
                        }

                        className="w-14 h-14 rounded-2xl bg-white border-[3px] border-[#1d2b53] flex items-center justify-center shadow-[3px_3px_0px_#1d2b53] hover:translate-y-[2px] transition-all"

                      >

                        <Pencil
                          size={22}
                          className="text-[#1d2b53]"
                        />

                      </button>

                      {/* DELETE */}

                      <button

                        onClick={() =>
                          deleteProject(
                            project.id
                          )
                        }

                        className="w-14 h-14 rounded-2xl bg-red-100 border-[3px] border-red-500 flex items-center justify-center shadow-[3px_3px_0px_#ef4444] hover:translate-y-[2px] transition-all"

                      >

                        <Trash2
                          size={22}
                          className="text-red-600"
                        />

                      </button>

                    </div>

                  </div>

                )
              )

            }

          </div>

        )

      }

      {/* MODAL */}

      {

        showModal && (

          <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">

            <div className="w-full max-w-2xl bg-[#f7f3ea] border-[5px] border-[#1d2b53] rounded-[38px] shadow-[10px_10px_0px_#1d2b53] overflow-hidden">

              {/* HEADER */}

              <div className="bg-[#fff7d6] border-b-[5px] border-[#1d2b53] px-8 py-7 flex items-center justify-between">

                <div>

                  <h1 className="text-4xl font-black text-[#1d2b53]">

                    {

                      editing

                      ? "Edit Project"

                      : "Create Project"

                    }

                  </h1>

                  <p className="text-[#5c6b8a] mt-2">

                    Manage sprint project details

                  </p>

                </div>

                <button

                  onClick={
                    closeModal
                  }

                  className="w-14 h-14 rounded-2xl bg-white border-[3px] border-[#1d2b53] flex items-center justify-center"

                >

                  <X
                    size={24}
                    className="text-[#1d2b53]"
                  />

                </button>

              </div>

              {/* FORM */}

              <div className="p-8 space-y-6">

                {/* NAME */}

                <div>

                  <label className="block text-[#1d2b53] font-black mb-3">

                    Project Name

                  </label>

                  <input

                    type="text"

                    value={name}

                    onChange={(e) =>
                      setName(
                        e.target.value
                      )
                    }

                    className="w-full rounded-[24px] border-[4px] border-[#1d2b53] bg-white px-6 py-5 outline-none shadow-[4px_4px_0px_#1d2b53]"

                  />

                </div>

                {/* DESCRIPTION */}

                <div>

                  <label className="block text-[#1d2b53] font-black mb-3">

                    Description

                  </label>

                  <textarea

                    rows={4}

                    value={description}

                    onChange={(e) =>
                      setDescription(
                        e.target.value
                      )
                    }

                    className="w-full rounded-[24px] border-[4px] border-[#1d2b53] bg-white px-6 py-5 outline-none resize-none shadow-[4px_4px_0px_#1d2b53]"

                  />

                </div>

                {/* TECH */}

                <div>

                  <label className="block text-[#1d2b53] font-black mb-3">

                    Tech Stack

                  </label>

                  <input

                    type="text"

                    value={techStack}

                    onChange={(e) =>
                      setTechStack(
                        e.target.value
                      )
                    }

                    placeholder="React, Supabase, Tailwind"

                    className="w-full rounded-[24px] border-[4px] border-[#1d2b53] bg-white px-6 py-5 outline-none shadow-[4px_4px_0px_#1d2b53]"

                  />

                </div>

                {/* DEADLINE */}

                <div>

                  <label className="block text-[#1d2b53] font-black mb-3">

                    Deadline

                  </label>

                  <input

                    type="date"

                    value={deadline}

                    onChange={(e) =>
                      setDeadline(
                        e.target.value
                      )
                    }

                    className="w-full rounded-[24px] border-[4px] border-[#1d2b53] bg-white px-6 py-5 outline-none shadow-[4px_4px_0px_#1d2b53]"

                  />

                </div>

                {/* COLOR */}

                <div>

                  <label className="block text-[#1d2b53] font-black mb-3">

                    Card Color

                  </label>

                  <input

                    type="color"

                    value={color}

                    onChange={(e) =>
                      setColor(
                        e.target.value
                      )
                    }

                    className="w-28 h-16 rounded-2xl border-[4px] border-[#1d2b53] bg-white p-2"

                  />

                </div>

                {/* BUTTON */}

                <button

                  onClick={

                    editing

                    ? updateProject

                    : createProject

                  }

                  className="w-full bg-[#3b82f6] text-white py-5 rounded-[24px] border-[4px] border-[#1d2b53] shadow-[5px_5px_0px_#1d2b53] font-black text-2xl hover:translate-y-[2px] transition-all"

                >

                  {

                    editing

                    ? "Update Project"

                    : "Create Project"

                  }

                </button>

              </div>

            </div>

          </div>

        )

      }

    </div>

  );

}

export default Projects;