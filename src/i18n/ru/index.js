// Russian

export default {
  globals: {
    open: "Открыть",
    close: "Закрыть",
    edited: "изменено",
    listEmpty: "Список пуст",
    due: "До",
  },
  welcome: "Добро пожаловать!",
  header: "Дистанционное обучение ХРТК",
  files: "Файлы",
  filesMissing: "Файлы отсутствуют",
  mark: "Оценка",
  main: {
    toolbar: {
      notifications: "Уведомления",
      notificationsListEmpty: "Список уведомлений пуст",
      tooltips: {
        deleteRead: "Удалить прочитанные уведомления",
        markAllAsRead: "Пометить всё как прочитанное",
        markAsUnread: "Пометить как непрочитанное",
        markAsRead: "Пометить как прочитанное",
        lang: "Язык",
        logout: "Выйти из аккаунта",
      },
    },

    drawer: {
      home: "Главная",
      bill: "Ведомость",
      github: "Сообщить о проблеме",
      telegram: "Написать разработчику",
      appColor: "Цвет приложения",
      darkTheme: "Тёмная тема",
      todo: "Список дел",
    },
  },

  auth: {
    email: {
      label: "Укажите адрес электронной почты",
      wrong: "Пожалуйста, укажите действительный адрес электронной почты",
    },
    password: "Введите пароль",
    login: "Войти",
  },

  index: {
    classesList: "Список предметов",
    course: {
      open: "Открыть задания",
    },
    admin: {
      teachers: "Преподаватели",
    },
  },

  course: {
    tabs: {
      all: "Всё",
      message: "Сообщение",
      lection: "Лекция",
      practical: "Практика",
      test: "Tест",
      acw: "Административная контрольная работа",
    },
    assignment: {
      open: "Открыть задание",
    },
    createTask: "Создать задание",
  },

  taskDialog: {
    creating: "Создание задания",
    editing: "Редактирование задания",
    title: "Заголовок",
    description: {
      label: "Описание",
      hint: "Поддерживает {0} и {1}",
    },
    type: "Тип задания",
    conferenceEnabled: "Добавить ссылку на конференцию?",
    conferenceURL: "Ссылка на конференцию",
    addFiles: "Добавить файлы",
    uploadedFiles: "Загруженные файлы",
    test: {
      addVariant: "Добавить вариант",
      deleteVariant: {
        label: "Удалить вариант {0}",
        noVariantToDelete: "Нет варианта для удаления",
      },
      image: {
        add: "Прикрепите изображение к вопросу № {0}",
        tooltips: {
          deleteImage: "Удалить изображение",
        },
      },
      variant: "Вариант {0}",
      inputQuestion: "Введите вопрос",
      deleteQuestion: "Удалить вопрос",
      pointsAmount: "Количество баллов",
      inputAnswer: "Введите ответ",
      deleteAnswer: "Удалить ответ",
      addAnswer: "Добавить ответ",
      addQuestion: "Добавить вопрос",
      maxMark: "Максимальная оценка",
      allowZeroMark: "Разрешить высталение нуля",
      due: {
        tooltips: {
          pickDate: "Выберите дату",
          pickTime: "Выберите время",
        },
      },
      create: "Создать",
      update: "Обновить",
    },
  },

  assignment: {
    tabs: {
      assignment: "Задание",
      studentsWork: "Работы студентов",
    },
    deleteAssignment: "Удалить задание",
    description: "Описание задания",
    pinnedFiles: "Прикрепленные файлы",
    comment: "Введите комментарий",
    student: {
      yourWork: "Ваша работа",
      gradeSet: "Оценка",
      turnedIn: "Сдано",
      turnedInLate: "Сдано с опозданием",
      missing: "Не сдано",
      assigned: "Назначено",
      test: {
        label: "Тест (вариант {0})",
        question: {
          label: "Вопрос",
        },
        timeIsOver: "Время вышло",
        viewTest: "Посмотреть ответы на тест",
        takeTest: "Пройти тест",
      },
      pickFiles: "Выбрать файлы для загрузки",
      unsubmit: "Отменить отправку",
      turnIn: "Сдать",
    },
    privateComment: "Введите личный комментарий",
    teacher: {
      openWork: "Открыть работу",
      studentsWork: "Студенческая работа",
      status: "Статус",
      seen: "Просмотрено",
      turnedIn: "Сдано",
      turnedInOnTime: "Сдано вовремя",
      edited: "Отредактировано",
      studentsWhoDidntOpen: "Студенты, которые не просматривали задание",
      test: "Тест",
      testResults: "Результаты теста: {0} баллов из {1}",
      viewTestAnswers: "Просмотреть ответы",
    },
    tooltips: {
      editAssignment: "Редактировать задание",
      sendPublicComment: "Отправить публичный комментарий",
      deleteComment: "Удалить комментарий",
      uploadFiles: "Загрузить файлы",
      deleteFile: "Удалить файл",
      sendPrivateComment: "Отправить приватный комментарий",
    },
  },
  bill: {
    caption: "Добавить задание в ведомость",
    noTasks: "Задания для этой группы отсутствуют",
    download: "Скачать ведомость",
    selectAll: "Выбрать всё",
    deselectAll: "Убрать выделение со всего",
  },
  errors: {
    empty: "Это поле не может быть пустым",
  },
};
