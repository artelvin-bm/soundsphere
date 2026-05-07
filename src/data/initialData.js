export const initialData = {
  users: [
    {
      id: 1,
      name: "Demo User",
      email: "demo@soundsphere.test",
      password: "password123",
    },
  ],

  projects: [
    {
      id: 1,
      ownerId: 1,
      title: "Acoustic Demo Track",
      description: "Initial collaboration space for guitar and vocal drafts.",
      status: "In Progress",
      files: [
        {
          id: 1,
          name: "demo_mix_v1.mp3",
          label: "Mix v1",
          size: "4.2 MB",
          type: "audio/mpeg",
          date: "2026-04-15",
        },
      ],
      tasks: [
        {
          id: 1,
          title: "Record clean vocal take",
          assignee: "Dre",
          status: "Done",
        },
        {
          id: 2,
          title: "Upload bass layer",
          assignee: "Member",
          status: "In Progress",
        },
      ],
    },
  ],
};