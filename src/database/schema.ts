import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  AnyPgColumn,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============ ENUMS ============
export const roleEnum = pgEnum("role", ["employee", "instructor", "admin"]);
export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "active",
  "completed",
  "dropped",
]);
export const questionTypeEnum = pgEnum("question_type", [
  "single_choice",
  "multiple_choice",
  "true_false",
]);
export const docTypeEnum = pgEnum("doc_type", [
  "id_card",
  "contract",
  "certificate",
  "other",
]);
export const verificationStatusEnum = pgEnum("verification_status", [
  "pending",
  "verified",
  "rejected",
]);
export const assignmentStatusEnum = pgEnum("assignment_status", [
  "assigned",
  "in_progress",
  "completed",
  "overdue",
]);
export const approvalStatusEnum = pgEnum("approval_status", [
  "pending",
  "approved",
  "rejected",
]);

// ============ USERS ============
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("employee"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============ CATEGORIES ============
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
});

// ============ COURSES ============
export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  instructorId: uuid("instructor_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============ MODULES ============
export const modules = pgTable("modules", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============ LESSONS ============
export const lessons = pgTable("lessons", {
  id: uuid("id").primaryKey().defaultRandom(),
  moduleId: uuid("module_id")
    .notNull()
    .references(() => modules.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  videoUrl: text("video_url"),
  durationSeconds: integer("duration_seconds"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============ ENROLLMENTS ============
export const enrollments = pgTable("enrollments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  status: enrollmentStatusEnum("status").notNull().default("active"),
  enrolledAt: timestamp("enrolled_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

// ============ LESSON PROGRESS ============
export const lessonProgress = pgTable("lesson_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  enrollmentId: uuid("enrollment_id")
    .notNull()
    .references(() => enrollments.id, { onDelete: "cascade" }),
  lessonId: uuid("lesson_id")
    .notNull()
    .references(() => lessons.id, { onDelete: "cascade" }),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
});

// ============ QUIZZES ============
export const quizzes = pgTable("quizzes", {
  id: uuid("id").primaryKey().defaultRandom(),
  moduleId: uuid("module_id")
    .notNull()
    .references(() => modules.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  passingScore: integer("passing_score").notNull().default(70),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============ QUIZ QUESTIONS ============
export const quizQuestions = pgTable("quiz_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  quizId: uuid("quiz_id")
    .notNull()
    .references(() => quizzes.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  type: questionTypeEnum("type").notNull().default("single_choice"),
  order: integer("order").notNull().default(0),
});

// ============ QUIZ OPTIONS ============
export const quizOptions = pgTable("quiz_options", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionId: uuid("question_id")
    .notNull()
    .references(() => quizQuestions.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  isCorrect: boolean("is_correct").notNull().default(false),
});

// ============ QUIZ ATTEMPTS ============
export const quizAttempts = pgTable("quiz_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  quizId: uuid("quiz_id")
    .notNull()
    .references(() => quizzes.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  passed: boolean("passed").notNull().default(false),
  attemptedAt: timestamp("attempted_at").notNull().defaultNow(),
});

// ============ ASSIGNMENTS (pengerucutan dari modules) ============
export const assignments = pgTable("assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  moduleId: uuid("module_id")
    .notNull()
    .references(() => modules.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  instruction: text("instruction"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============ ASSIGNMENT SUBMISSIONS (pengerucutan dari assignments) ============
export const assignmentSubmissions = pgTable("assignment_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  assignmentId: uuid("assignment_id")
    .notNull()
    .references(() => assignments.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  submissionUrl: text("submission_url"),
  submissionText: text("submission_text"),
  grade: integer("grade"),
  feedback: text("feedback"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

// ============ QUIZ ATTEMPT ANSWERS (pengerucutan dari quizAttempts) ============
export const quizAttemptAnswers = pgTable("quiz_attempt_answers", {
  id: uuid("id").primaryKey().defaultRandom(),
  attemptId: uuid("attempt_id")
    .notNull()
    .references(() => quizAttempts.id, { onDelete: "cascade" }),
  questionId: uuid("question_id")
    .notNull()
    .references(() => quizQuestions.id, { onDelete: "cascade" }),
  selectedOptionId: uuid("selected_option_id").references(
    () => quizOptions.id,
    { onDelete: "set null" }
  ),
  isCorrect: boolean("is_correct").notNull().default(false),
});

// ============ DEPARTMENTS (reference table — BUKAN pengerucutan, employees nunjuk ke sini) ============
export const departments = pgTable("departments", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 150 }).notNull(),
  parentDepartmentId: uuid("parent_department_id").references(
    (): AnyPgColumn => departments.id
  ),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============ EMPLOYEES (pengerucutan L1, dari users) ============
export const employees = pgTable("employees", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  employeeCode: varchar("employee_code", { length: 50 }).notNull().unique(),
  position: varchar("position", { length: 150 }).notNull(),
  departmentId: uuid("department_id")
    .notNull()
    .references(() => departments.id, { onDelete: "restrict" }),
  managerId: uuid("manager_id").references(
    (): AnyPgColumn => employees.id
  ),
  hireDate: timestamp("hire_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============ EMPLOYEE DOCUMENTS (pengerucutan L2a, dari employees) ============
export const employeeDocuments = pgTable("employee_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  employeeId: uuid("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  docType: docTypeEnum("doc_type").notNull(),
  fileUrl: text("file_url").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// ============ EMPLOYEE DOCUMENT VERIFICATIONS (pengerucutan L3a, dari employeeDocuments) ============
export const employeeDocumentVerifications = pgTable(
  "employee_document_verifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => employeeDocuments.id, { onDelete: "cascade" }),
    verifiedById: uuid("verified_by_id")
      .notNull()
      .references(() => employees.id, { onDelete: "restrict" }),
    status: verificationStatusEnum("status").notNull().default("pending"),
    notes: text("notes"),
    verifiedAt: timestamp("verified_at"),
  }
);

// ============ TRAINING ASSIGNMENTS (pengerucutan L2b, dari employees — cabang lain, beda dari enrollment) ============
export const trainingAssignments = pgTable("training_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  employeeId: uuid("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  assignedById: uuid("assigned_by_id")
    .notNull()
    .references(() => employees.id, { onDelete: "restrict" }),
  mandatory: boolean("mandatory").notNull().default(true),
  dueDate: timestamp("due_date"),
  status: assignmentStatusEnum("status").notNull().default("assigned"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============ TRAINING ASSIGNMENT APPROVALS ============
export const trainingAssignmentApprovals = pgTable(
  "training_assignment_approvals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    trainingAssignmentId: uuid("training_assignment_id")
      .notNull()
      .references(() => trainingAssignments.id, { onDelete: "cascade" }),
    approverId: uuid("approver_id")
      .notNull()
      .references(() => employees.id, { onDelete: "restrict" }),
    status: approvalStatusEnum("status").notNull().default("pending"),
    notes: text("notes"),
    decidedAt: timestamp("decided_at"),
  }
);

// ============ TRAINING ASSIGNMENT APPROVAL HISTORY ============
export const trainingAssignmentApprovalHistory = pgTable(
  "training_assignment_approval_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    approvalId: uuid("approval_id")
      .notNull()
      .references(() => trainingAssignmentApprovals.id, {
        onDelete: "cascade",
      }),
    previousStatus: approvalStatusEnum("previous_status").notNull(),
    newStatus: approvalStatusEnum("new_status").notNull(),
    changedById: uuid("changed_by_id")
      .notNull()
      .references(() => employees.id, { onDelete: "restrict" }),
    changedAt: timestamp("changed_at").notNull().defaultNow(),
  }
);

// ============ RELATIONS ============
export const usersRelations = relations(users, ({ one, many }) => ({
  employee: one(employees),
  coursesTaught: many(courses),
  enrollments: many(enrollments),
  quizAttempts: many(quizAttempts),
  assignmentSubmissions: many(assignmentSubmissions),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  instructor: one(users, {
    fields: [courses.instructorId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [courses.categoryId],
    references: [categories.id],
  }),
  modules: many(modules),
  enrollments: many(enrollments),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
  course: one(courses, {
    fields: [modules.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
  quizzes: many(quizzes),
  assignments: many(assignments),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  module: one(modules, {
    fields: [lessons.moduleId],
    references: [modules.id],
  }),
  progress: many(lessonProgress),
}));

export const enrollmentsRelations = relations(enrollments, ({ one, many }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
  lessonProgress: many(lessonProgress),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  enrollment: one(enrollments, {
    fields: [lessonProgress.enrollmentId],
    references: [enrollments.id],
  }),
  lesson: one(lessons, {
    fields: [lessonProgress.lessonId],
    references: [lessons.id],
  }),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  module: one(modules, {
    fields: [quizzes.moduleId],
    references: [modules.id],
  }),
  questions: many(quizQuestions),
  attempts: many(quizAttempts),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [quizQuestions.quizId],
    references: [quizzes.id],
  }),
  options: many(quizOptions),
}));

export const quizOptionsRelations = relations(quizOptions, ({ one }) => ({
  question: one(quizQuestions, {
    fields: [quizOptions.questionId],
    references: [quizQuestions.id],
  }),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one, many }) => ({
  user: one(users, {
    fields: [quizAttempts.userId],
    references: [users.id],
  }),
  quiz: one(quizzes, {
    fields: [quizAttempts.quizId],
    references: [quizzes.id],
  }),
  answers: many(quizAttemptAnswers),
}));

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  module: one(modules, {
    fields: [assignments.moduleId],
    references: [modules.id],
  }),
  submissions: many(assignmentSubmissions),
}));

export const assignmentSubmissionsRelations = relations(
  assignmentSubmissions,
  ({ one }) => ({
    assignment: one(assignments, {
      fields: [assignmentSubmissions.assignmentId],
      references: [assignments.id],
    }),
    user: one(users, {
      fields: [assignmentSubmissions.userId],
      references: [users.id],
    }),
  })
);

export const quizAttemptAnswersRelations = relations(
  quizAttemptAnswers,
  ({ one }) => ({
    attempt: one(quizAttempts, {
      fields: [quizAttemptAnswers.attemptId],
      references: [quizAttempts.id],
    }),
    question: one(quizQuestions, {
      fields: [quizAttemptAnswers.questionId],
      references: [quizQuestions.id],
    }),
    selectedOption: one(quizOptions, {
      fields: [quizAttemptAnswers.selectedOptionId],
      references: [quizOptions.id],
    }),
  })
);

export const departmentsRelations = relations(departments, ({ one, many }) => ({
  parentDepartment: one(departments, {
    fields: [departments.parentDepartmentId],
    references: [departments.id],
    relationName: "departmentHierarchy",
  }),
  subDepartments: many(departments, { relationName: "departmentHierarchy" }),
  employees: many(employees),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  user: one(users, {
    fields: [employees.userId],
    references: [users.id],
  }),
  department: one(departments, {
    fields: [employees.departmentId],
    references: [departments.id],
  }),
  manager: one(employees, {
    fields: [employees.managerId],
    references: [employees.id],
    relationName: "managerHierarchy",
  }),
  directReports: many(employees, { relationName: "managerHierarchy" }),
  documents: many(employeeDocuments),
  trainingAssignments: many(trainingAssignments, {
    relationName: "employeeAssignments",
  }),
  assignedTrainings: many(trainingAssignments, {
    relationName: "assignedByEmployee",
  }),
}));

export const employeeDocumentsRelations = relations(
  employeeDocuments,
  ({ one, many }) => ({
    employee: one(employees, {
      fields: [employeeDocuments.employeeId],
      references: [employees.id],
    }),
    verifications: many(employeeDocumentVerifications),
  })
);

export const employeeDocumentVerificationsRelations = relations(
  employeeDocumentVerifications,
  ({ one }) => ({
    document: one(employeeDocuments, {
      fields: [employeeDocumentVerifications.documentId],
      references: [employeeDocuments.id],
    }),
    verifiedBy: one(employees, {
      fields: [employeeDocumentVerifications.verifiedById],
      references: [employees.id],
    }),
  })
);

export const trainingAssignmentsRelations = relations(
  trainingAssignments,
  ({ one, many }) => ({
    employee: one(employees, {
      fields: [trainingAssignments.employeeId],
      references: [employees.id],
      relationName: "employeeAssignments",
    }),
    assignedBy: one(employees, {
      fields: [trainingAssignments.assignedById],
      references: [employees.id],
      relationName: "assignedByEmployee",
    }),
    course: one(courses, {
      fields: [trainingAssignments.courseId],
      references: [courses.id],
    }),
    approvals: many(trainingAssignmentApprovals),
  })
);

export const trainingAssignmentApprovalsRelations = relations(
  trainingAssignmentApprovals,
  ({ one, many }) => ({
    trainingAssignment: one(trainingAssignments, {
      fields: [trainingAssignmentApprovals.trainingAssignmentId],
      references: [trainingAssignments.id],
    }),
    approver: one(employees, {
      fields: [trainingAssignmentApprovals.approverId],
      references: [employees.id],
    }),
    history: many(trainingAssignmentApprovalHistory),
  })
);

export const trainingAssignmentApprovalHistoryRelations = relations(
  trainingAssignmentApprovalHistory,
  ({ one }) => ({
    approval: one(trainingAssignmentApprovals, {
      fields: [trainingAssignmentApprovalHistory.approvalId],
      references: [trainingAssignmentApprovals.id],
    }),
    changedBy: one(employees, {
      fields: [trainingAssignmentApprovalHistory.changedById],
      references: [employees.id],
    }),
  })
);