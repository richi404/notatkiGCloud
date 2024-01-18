provider "google" {
  credentials = file(var.credentials_file)
  project     = var.project_id
  region      = var.region
  zone        = var.zone
}

resource "google_cloud_run_service" "nodejs_app" {
  name     = "nodejs-app"
  location = var.region

  template {
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale" = 1
        "run.googleapis.com/cloudsql-instances" = google_sql_database_instance.notes_sql_database.connection_name
      }
    }
    spec {
      containers {
        image = var.nodejs_app_image
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

resource "google_cloud_run_service" "reactjs_app" {
  name     = "reactjs-app"
  location = var.region

  template {
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale" = 1
      }
    }
    spec {
      containers {
        image = var.reactjs_app_image
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

resource "google_sql_database_instance" "notes_sql_database" {
  name             = var.database_name
  database_version = "MYSQL_8_0"
  region           = var.region

  settings {
    tier = "db-f1-micro"
    database_flags {
      name  = "cloudsql_iam_authentication"
      value = "on"
    }
  }
}

resource "google_storage_bucket" "image_notes_bucket" {
  name     = "image_notes_bucket"
  location = var.region
}

data "google_iam_policy" "noauth" {
  binding {
    role    = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}

resource "google_cloud_run_service_iam_policy" "noauth" {
  location    = google_cloud_run_service.nodejs_app.location
  project     = google_cloud_run_service.nodejs_app.project
  service     = google_cloud_run_service.nodejs_app.name
  policy_data = data.google_iam_policy.noauth.policy_data
}

resource "google_cloud_run_service_iam_policy" "noauth2" {
  location    = google_cloud_run_service.reactjs_app.location
  project     = google_cloud_run_service.reactjs_app.project
  service     = google_cloud_run_service.reactjs_app.name
  policy_data = data.google_iam_policy.noauth.policy_data
}
