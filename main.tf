provider "google" {
  credentials = file("credentials.json")
  project     = "golden-index-410209"
  region      = "europe-west1"
  zone        = "europe-west1-b"
}

# resource "google_compute_subnetwork" "private_subnet_1" {
#   name          = "private-subnet-1"
#   network       = google_compute_network.internal_vpc.self_link
#   ip_cidr_range = "10.0.0.0/24"
#   region        = "europe-west1"
# }
# output "subnet_1" {
#   value = google_compute_subnetwork.private_subnet_1.self_link
# }

resource "google_cloud_run_service" "nodejs_app" {
  name     = "nodejs-app"
  location = "europe-west1"

  template {
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale" = 1
        # "run.googleapis.com/vpc-access-connector" = "project-connector2"
        # "run.googleapis.com/vpc-access-egress"    = "all-traffic"
      }
    }
    spec {
      containers {
        image = "europe-west1-docker.pkg.dev/golden-index-410209/projektsabre/nodejs-app:latest"
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
  location = "europe-west1"

  template {
    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale" = 1
        # "run.googleapis.com/vpc-access-connector" = element(tolist(module.serverless_connector.connector_ids), 1)
        # "run.googleapis.com/vpc-access-egress"    = "all-traffic"
      }
    }
    spec {
      containers {
        image = "europe-west1-docker.pkg.dev/golden-index-410209/projektsabre/reactjs-app:latest"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}

resource "google_cloud_run_service_iam_policy" "noauth" {
  location = google_cloud_run_service.nodejs_app.location
  project  = google_cloud_run_service.nodejs_app.project
  service  = google_cloud_run_service.nodejs_app.name

  policy_data = data.google_iam_policy.noauth.policy_data
}

resource "google_cloud_run_service_iam_policy" "noauth2" {
  location = google_cloud_run_service.reactjs_app.location
  project  = google_cloud_run_service.reactjs_app.project
  service  = google_cloud_run_service.reactjs_app.name

  policy_data = data.google_iam_policy.noauth.policy_data
}
