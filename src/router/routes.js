const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/Index.vue") },
      { path: "settings", component: () => import("pages/Settings.vue") },
      { path: "profile", component: () => import("pages/Profile.vue") },
      { path: "course/:courseId", component: () => import("pages/Course.vue") },
      {
        path: "assignment/:courseId/:assignmentId",
        component: () => import("pages/Assignment.vue"),
      },
    ],
  },
  {
    path: "*",
    redirect: "/",
  },
];

export default routes;
