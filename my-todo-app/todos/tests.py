from django.test import TestCase, Client
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from .models import Todo
from .forms import TodoForm


class TodoModelTests(TestCase):
    """Test cases for the Todo model"""

    def setUp(self):
        """Create test todos"""
        self.todo = Todo.objects.create(
            title="Test Todo",
            description="Test description",
            completed=False
        )

    def test_todo_creation(self):
        """Test that a todo can be created with required fields"""
        self.assertEqual(self.todo.title, "Test Todo")
        self.assertEqual(self.todo.description, "Test description")
        self.assertFalse(self.todo.completed)
        self.assertIsNotNone(self.todo.created_at)
        self.assertIsNotNone(self.todo.updated_at)

    def test_todo_string_representation(self):
        """Test the string representation of a todo"""
        self.assertEqual(str(self.todo), "Test Todo")

    def test_todo_default_completed_status(self):
        """Test that todos are not completed by default"""
        new_todo = Todo.objects.create(title="New Todo")
        self.assertFalse(new_todo.completed)

    def test_todo_ordering(self):
        """Test that todos are ordered by creation date (newest first)"""
        todo1 = Todo.objects.create(title="First")
        todo2 = Todo.objects.create(title="Second")
        todo3 = Todo.objects.create(title="Third")

        todos = Todo.objects.all()
        self.assertEqual(todos[0].title, "Third")
        self.assertEqual(todos[1].title, "Second")
        self.assertEqual(todos[2].title, "First")

    def test_is_overdue_no_due_date(self):
        """Test that todo without due date is not overdue"""
        self.assertFalse(self.todo.is_overdue())

    def test_is_overdue_future_due_date(self):
        """Test that todo with future due date is not overdue"""
        self.todo.due_date = timezone.now() + timedelta(days=1)
        self.todo.save()
        self.assertFalse(self.todo.is_overdue())

    def test_is_overdue_past_due_date(self):
        """Test that incomplete todo with past due date is overdue"""
        self.todo.due_date = timezone.now() - timedelta(days=1)
        self.todo.save()
        self.assertTrue(self.todo.is_overdue())

    def test_is_not_overdue_when_completed(self):
        """Test that completed todo with past due date is not overdue"""
        self.todo.due_date = timezone.now() - timedelta(days=1)
        self.todo.completed = True
        self.todo.save()
        self.assertFalse(self.todo.is_overdue())

    def test_todo_optional_fields(self):
        """Test that description and due_date can be blank"""
        minimal_todo = Todo.objects.create(title="Minimal Todo")
        self.assertIsNone(minimal_todo.description)
        self.assertIsNone(minimal_todo.due_date)


class TodoFormTests(TestCase):
    """Test cases for the TodoForm"""

    def test_valid_form(self):
        """Test form with valid data"""
        form_data = {
            'title': 'Test Todo',
            'description': 'Test description',
            'completed': False
        }
        form = TodoForm(data=form_data)
        self.assertTrue(form.is_valid())

    def test_form_without_optional_fields(self):
        """Test form with only required field (title)"""
        form_data = {'title': 'Test Todo'}
        form = TodoForm(data=form_data)
        self.assertTrue(form.is_valid())

    def test_form_missing_required_field(self):
        """Test form without title (required field)"""
        form_data = {'description': 'Test description'}
        form = TodoForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('title', form.errors)

    def test_form_with_due_date(self):
        """Test form with due date"""
        future_date = timezone.now() + timedelta(days=7)
        form_data = {
            'title': 'Test Todo',
            'due_date': future_date
        }
        form = TodoForm(data=form_data)
        self.assertTrue(form.is_valid())


class TodoViewTests(TestCase):
    """Test cases for Todo views"""

    def setUp(self):
        """Set up test client and create test todos"""
        self.client = Client()
        self.todo1 = Todo.objects.create(
            title="Todo 1",
            description="First todo",
            completed=False
        )
        self.todo2 = Todo.objects.create(
            title="Todo 2",
            description="Second todo",
            completed=True
        )

    def test_home_view(self):
        """Test that home page loads successfully"""
        response = self.client.get(reverse('home'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'home.html')

    def test_todo_list_view(self):
        """Test that todo list view displays all todos"""
        response = self.client.get(reverse('todo-list'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'todos/todo_list.html')
        self.assertContains(response, "Todo 1")
        self.assertContains(response, "Todo 2")

    def test_todo_list_context(self):
        """Test that todo list view includes completed and pending counts"""
        response = self.client.get(reverse('todo-list'))
        self.assertEqual(response.context['completed_count'], 1)
        self.assertEqual(response.context['pending_count'], 1)

    def test_todo_create_view_get(self):
        """Test GET request to create view displays form"""
        response = self.client.get(reverse('todo-create'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'todos/todo_form.html')
        self.assertIsInstance(response.context['form'], TodoForm)

    def test_todo_create_view_post(self):
        """Test POST request creates new todo"""
        initial_count = Todo.objects.count()
        response = self.client.post(reverse('todo-create'), {
            'title': 'New Todo',
            'description': 'New description',
            'completed': False
        })
        self.assertEqual(response.status_code, 302)  # Redirect after success
        self.assertEqual(Todo.objects.count(), initial_count + 1)
        new_todo = Todo.objects.latest('created_at')
        self.assertEqual(new_todo.title, 'New Todo')

    def test_todo_update_view_get(self):
        """Test GET request to update view displays form with existing data"""
        response = self.client.get(reverse('todo-edit', kwargs={'pk': self.todo1.pk}))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'todos/todo_form.html')
        self.assertEqual(response.context['form'].instance, self.todo1)

    def test_todo_update_view_post(self):
        """Test POST request updates existing todo"""
        response = self.client.post(
            reverse('todo-edit', kwargs={'pk': self.todo1.pk}),
            {
                'title': 'Updated Todo',
                'description': 'Updated description',
                'completed': True
            }
        )
        self.assertEqual(response.status_code, 302)
        self.todo1.refresh_from_db()
        self.assertEqual(self.todo1.title, 'Updated Todo')
        self.assertTrue(self.todo1.completed)

    def test_todo_delete_view_get(self):
        """Test GET request to delete view displays confirmation"""
        response = self.client.get(reverse('todo-delete', kwargs={'pk': self.todo1.pk}))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'todos/todo_confirm_delete.html')

    def test_todo_delete_view_post(self):
        """Test POST request deletes the todo"""
        initial_count = Todo.objects.count()
        response = self.client.post(reverse('todo-delete', kwargs={'pk': self.todo1.pk}))
        self.assertEqual(response.status_code, 302)
        self.assertEqual(Todo.objects.count(), initial_count - 1)
        with self.assertRaises(Todo.DoesNotExist):
            Todo.objects.get(pk=self.todo1.pk)

    def test_todo_toggle_complete(self):
        """Test toggling todo completion status"""
        initial_status = self.todo1.completed
        response = self.client.get(reverse('todo-toggle', kwargs={'pk': self.todo1.pk}))
        self.assertEqual(response.status_code, 302)  # Redirects to todo-list
        self.todo1.refresh_from_db()
        self.assertNotEqual(self.todo1.completed, initial_status)

    def test_todo_toggle_complete_ajax(self):
        """Test toggling todo completion via AJAX"""
        initial_status = self.todo1.completed
        response = self.client.get(
            reverse('todo-toggle', kwargs={'pk': self.todo1.pk}),
            HTTP_X_REQUESTED_WITH='XMLHttpRequest'
        )
        self.assertEqual(response.status_code, 200)
        self.todo1.refresh_from_db()
        self.assertNotEqual(self.todo1.completed, initial_status)

        # Check JSON response
        import json
        data = json.loads(response.content)
        self.assertEqual(data['completed'], self.todo1.completed)

    def test_view_nonexistent_todo(self):
        """Test accessing non-existent todo returns 404"""
        response = self.client.get(reverse('todo-edit', kwargs={'pk': 9999}))
        self.assertEqual(response.status_code, 404)


class TodoIntegrationTests(TestCase):
    """Integration tests for complete todo workflows"""

    def setUp(self):
        """Set up test client"""
        self.client = Client()

    def test_complete_todo_workflow(self):
        """Test creating, updating, completing, and deleting a todo"""
        # Create a new todo
        response = self.client.post(reverse('todo-create'), {
            'title': 'Integration Test Todo',
            'description': 'Testing complete workflow',
            'completed': False
        })
        self.assertEqual(response.status_code, 302)

        # Get the created todo
        todo = Todo.objects.get(title='Integration Test Todo')
        self.assertFalse(todo.completed)

        # Update the todo
        response = self.client.post(
            reverse('todo-edit', kwargs={'pk': todo.pk}),
            {
                'title': 'Updated Integration Test',
                'description': 'Updated description',
                'completed': False
            }
        )
        todo.refresh_from_db()
        self.assertEqual(todo.title, 'Updated Integration Test')

        # Toggle completion
        response = self.client.get(reverse('todo-toggle', kwargs={'pk': todo.pk}))
        todo.refresh_from_db()
        self.assertTrue(todo.completed)

        # Delete the todo
        response = self.client.post(reverse('todo-delete', kwargs={'pk': todo.pk}))
        self.assertEqual(Todo.objects.filter(pk=todo.pk).count(), 0)

    def test_multiple_todos_management(self):
        """Test managing multiple todos"""
        # Create multiple todos
        for i in range(5):
            Todo.objects.create(
                title=f"Todo {i}",
                completed=(i % 2 == 0)
            )

        # Check list view shows all todos
        response = self.client.get(reverse('todo-list'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.context['todos']), 5)

        # Check counts
        self.assertEqual(response.context['completed_count'], 3)  # 0, 2, 4
        self.assertEqual(response.context['pending_count'], 2)    # 1, 3

    def test_overdue_todos_workflow(self):
        """Test creating and checking overdue todos"""
        # Create overdue todo
        overdue_todo = Todo.objects.create(
            title="Overdue Todo",
            due_date=timezone.now() - timedelta(days=2),
            completed=False
        )
        self.assertTrue(overdue_todo.is_overdue())

        # Complete it and check it's no longer overdue
        overdue_todo.completed = True
        overdue_todo.save()
        self.assertFalse(overdue_todo.is_overdue())

        # Create future todo
        future_todo = Todo.objects.create(
            title="Future Todo",
            due_date=timezone.now() + timedelta(days=2),
            completed=False
        )
        self.assertFalse(future_todo.is_overdue())
