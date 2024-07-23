pub use sea_orm_migration::prelude::*;

pub mod models;

pub struct Migrator;

mod m20240718_000001_create_user;
mod m20240718_000002_create_organization;
mod m20240718_000003_create_workspace;
mod m20240718_000004_create_group;
mod m20240718_000005_create_invitation;
mod m20240718_000006_create_snapshot;
mod m20240718_000007_create_file;
mod m20240718_000008_create_task;
mod m20240718_000009_create_grouppermission;
mod m20240718_000010_create_userpermission;
mod m20240723_000001_drop_organization_user;
mod m20240723_000002_drop_group_user;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20240718_000001_create_user::Migration),
            Box::new(m20240718_000002_create_organization::Migration),
            Box::new(m20240718_000003_create_workspace::Migration),
            Box::new(m20240718_000004_create_group::Migration),
            Box::new(m20240718_000005_create_invitation::Migration),
            Box::new(m20240718_000006_create_snapshot::Migration),
            Box::new(m20240718_000007_create_file::Migration),
            Box::new(m20240718_000008_create_task::Migration),
            Box::new(m20240718_000009_create_grouppermission::Migration),
            Box::new(m20240718_000010_create_userpermission::Migration),
            Box::new(m20240723_000001_drop_organization_user::Migration),
            Box::new(m20240723_000002_drop_group_user::Migration),
        ]
    }
}
