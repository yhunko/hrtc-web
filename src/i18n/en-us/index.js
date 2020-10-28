// English

export default {
  globals: {
    open: "Open",
    close: "Close",
    edited: "edited",
    listEmpty: "List is empty",
    due: "Due",
  },
  welcome: "Welcome!",
  header: "KRTC distance learning",
  files: "Files",
  filesMissing: "Files missing",
  mark: "Mark",
  main: {
    toolbar: {
      notifications: "Notifications",
      notificationsListEmpty: "Notifications list is empty",
      tooltips: {
        deleteRead: "Delete read notifications",
        markAllAsRead: "Mark all as read",
        markAsUnread: "Mark as unread",
        markAsRead: "Mark as read",
        lang: "Language",
        logout: "Logout",
      },
    },

    drawer: {
      home: "Home",
      bill: "Bill",
      github: "Report an issue",
      appColor: "App color",
      darkTheme: "Dark theme",
      todo: "Todo",
    },
  },
  tooltips: {
    editAssignment: "Edit assignment",
  },

  auth: {
    email: {
      label: "Input your email address",
      wrong: "Please enter a valid email address",
    },
    password: "Input your password",
    login: "Login",
  },

  index: {
    classesList: "Classes list",
    course: {
      open: "Open course tasks",
    },
    admin: {
      teachers: "Teachers",
    },
  },

  course: {
    tabs: {
      all: "All",
      message: "Message",
      lection: "Lection",
      practical: "Practical",
      test: "Test",
      acw: "Administrative work",
    },
    assignment: {
      open: "Open the assignment",
    },
    createTask: "Create task",
  },

  taskDialog: {
    creating: "Task creating",
    editing: "Task editing",
    title: "Title",
    description: {
      label: "Description",
      hint: "Supports {0} and {1}",
    },
    type: "Assignment type",
    conferenceEnabled: "Add conference link?",
    conferenceURL: "Conference link",
    addFiles: "Add files",
    uploadedFiles: "Uploaded files",
    test: {
      addVariant: "Add variant",
      deleteVariant: {
        label: "Delete variant {0}",
        noVariantToDelete: "No variant to delete",
      },
      image: {
        add: "Attach image for question {0}",
        tooltips: {
          deleteImage: "Delete image",
        },
      },
      variant: "Variant {0}",
      inputQuestion: "Input question",
      deleteQuestion: "Delete question",
      pointsAmount: "Points amount",
      inputAnswer: "Input answer",
      deleteAnswer: "Delete answer",
      addAnswer: "Add answer",
      addQuestion: "Add question",
      maxMark: "Max mark",
      allowZeroMark: "Allow zero mark",
      due: {
        tooltips: {
          pickDate: "Pick date",
          pickTime: "Pick time",
        },
      },
      create: "Create",
      update: "Update",
    },
  },

  assignment: {
    tabs: {
      assignment: "Assignment",
      studentsWork: "Students' work",
    },
    deleteAssignment: "Delete assignment",
    due: "Due",
    description: "Assignment description",
    pinnedFiles: "Pinned files",
    comment: "Input comment",
    student: {
      yourWork: "Your work",
      gradeSet: "Grade set",
      turnedIn: "Turned in",
      turnedInLate: "Turned in late",
      missing: "Missing",
      assigned: "Assigned",
      test: {
        label: "Test (variant {0})",
        question: {
          label: "Question",
        },
        timeIsOver: "Test time is over",
        viewTest: "View test answers",
        takeTest: "Take the test",
      },
      pickFiles: "Pick files to upload",
      unsubmit: "Unsubmit",
      turnIn: "Turn in",
    },
    privateComment: "Input private comment",
    teacher: {
      openWork: "Open work",
      studentsWork: "Student's work",
      status: "Status",
      seen: "Seen",
      turnedIn: "Turned in",
      turnedInOnTime: "Turned in on time",
      edited: "Edited",
      studentsWhoDidntOpen: "Students who didn't open the assignment",
      test: "Test",
      testResults: "Test results: {0} points of {1}",
      viewTestAnswers: "View answers",
    },
    tooltips: {
      editAssignment: "Edit assignment",
      sendPublicComment: "Send public comment",
      deleteComment: "Delete comment",
      uploadFiles: "Upload files",
      deleteFile: "Delete file",
      sendPrivateComment: "Send private comment",
    },
  },
  bill: {
    caption: "Choose tasks to export",
    noTasks: "No tasks for this group",
    download: "Download bill",
    selectAll: "Select all",
    deselectAll: "Deselect all",
  },
  errors: {
    empty: "This field can't be empty",
  },
};
