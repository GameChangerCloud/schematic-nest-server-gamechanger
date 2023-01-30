output "cluster_arn" {
  description = "Amazon Resource Name (ARN) of cluster"
  value       = try(aws_rds_cluster.postgresql.arn, "")
}

output "cluster_id" {
  description = "The RDS Cluster Identifier"
  value       = try(aws_rds_cluster.postgresql.id, "")
}

output "cluster_resource_id" {
  description = "The RDS Cluster Resource ID"
  value       = try(aws_rds_cluster.postgresql.cluster_resource_id, "")
}

output "cluster_members" {
  description = "List of RDS Instances that are a part of this cluster"
  value       = try(aws_rds_cluster.postgresql.cluster_members, "")
}

output "cluster_endpoint" {
  description = "Writer endpoint for the cluster"
  value       = try(aws_rds_cluster.postgresql.endpoint, "")
}

output "cluster_reader_endpoint" {
  description = "A read-only endpoint for the cluster, automatically load-balanced across replicas"
  value       = try(aws_rds_cluster.postgresql.reader_endpoint, "")
}

output "cluster_engine_version_actual" {
  description = "The running version of the cluster database"
  value       = try(aws_rds_cluster.postgresql.engine_version_actual, "")
}

output "cluster_database_name" {
  description = "Name for an automatically created database on cluster creation"
  value       = try(aws_rds_cluster.postgresql.database_name, "")
}

output "cluster_port" {
  description = "The database port"
  value       = try(aws_rds_cluster.postgresql.port, "")
}

output "cluster_master_password" {
  description = "The database master password"
  value       = try(aws_rds_cluster.postgresql.master_password, "")
  sensitive   = true
}

output "cluster_master_username" {
  description = "The database master username"
  value       = try(aws_rds_cluster.postgresql.master_username, "")
  sensitive   = true
}

output "cluster_proxy_endpoint" {
  description = "Proxy endpoint"
  value       = try(aws_db_proxy.postgresql[0].endpoint, "")
}
