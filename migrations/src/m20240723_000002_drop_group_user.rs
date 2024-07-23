use sea_orm_migration::prelude::*;

use crate::models::v1::{GroupUser};

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(
        &self,
        manager: &SchemaManager,
    ) -> Result<(), DbErr> {
        manager
            .drop_table(
                Table::drop()
                    .table(GroupUser::Table)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}
