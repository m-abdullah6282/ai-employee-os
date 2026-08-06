import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskOut, TaskUpdate
from app.core.exceptions import NotFoundError

router = APIRouter()


@router.post("/", response_model=TaskOut, status_code=201)
async def create_task(
    payload: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = Task(
        **payload.model_dump(),
        organization_id=current_user.organization_id,
        assigned_to_id=current_user.id,
    )
    db.add(task)
    await db.flush()
    return task


@router.get("/", response_model=list[TaskOut])
async def list_tasks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Task).where(Task.organization_id == current_user.organization_id)
    )
    return result.scalars().all()


@router.patch("/{task_id}", response_model=TaskOut)
async def update_task(
    task_id: uuid.UUID,
    payload: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Task).where(
            Task.id == task_id,
            Task.organization_id == current_user.organization_id,
        )
    )
    task = result.scalar_one_or_none()
    if not task:
        raise NotFoundError("Task not found")

    for key, value in payload.model_dump(exclude_none=True).items():
        setattr(task, key, value)

    return task


@router.delete("/{task_id}", status_code=204)
async def delete_task(
    task_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Task).where(
            Task.id == task_id,
            Task.organization_id == current_user.organization_id,
        )
    )
    task = result.scalar_one_or_none()
    if not task:
        raise NotFoundError("Task not found")
    await db.delete(task)