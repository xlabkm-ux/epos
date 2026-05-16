import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "ru",
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: {
          sidebar: {
            workplace: "Workplace",
            adr_review: "ADR Review",
            archive: "Archive",
            telemetry: "Telemetry",
            active_workspaces: "Active",
            pinned_workspaces: "Pinned",
            archived_workspaces: "Archive",
            new_workspace: "New Workspace",
            settings: "Settings",
            identity: "Identity (Pilot)",
          },
          workspace_menu: {
            share: "Share",
            pin: "Pin",
            unpin: "Unpin",
            rename: "Rename",
            archive: "Archive",
            restore: "Restore from archive",
          },
          archive_view: {
            title: "Workspace Archive",
            count: "items in neural storage",
            empty: "No archived workspaces found.",
            col_name: "Workspace Name",
            col_date: "Archived On",
            col_comment: "System Comment",
            no_comment: "No details provided",
            restore: "Restore",
          },
          share_modal: {
            title: "Public link",
            copy: "Copy link",
            warning:
              "Public links can be accessed by all users. Share information carefully.",
          },
        },
      },
      ru: {
        translation: {
          sidebar: {
            workplace: "Рабочее место",
            adr_review: "Обзор ADR",
            archive: "Архив",
            telemetry: "Телеметрия",
            active_workspaces: "Активные",
            pinned_workspaces: "Закреплённые",
            archived_workspaces: "Архив",
            new_workspace: "Новое пространство",
            settings: "Настройки",
            identity: "Личность (Pilot)",
          },
          workspace_menu: {
            share: "Поделиться чатом",
            pin: "Закрепить",
            unpin: "Открепить",
            rename: "Переименовать",
            archive: "Архивировать",
            restore: "Вернуть из архива",
          },
          archive_view: {
            title: "Архив рабочих пространств",
            count: "объектов в нейрохранилище",
            empty: "В архиве пока ничего нет.",
            col_name: "Название",
            col_date: "Дата архивации",
            col_comment: "Комментарий системы",
            no_comment: "Детали отсутствуют",
            restore: "Восстановить",
          },
          share_modal: {
            title: "Общедоступная ссылка",
            copy: "Скопировать ссылку",
            warning:
              "По общедоступным ссылкам могут переходить все пользователи. Делитесь информацией с осторожностью.",
          },
        },
      },
    },
  });

export default i18n;
