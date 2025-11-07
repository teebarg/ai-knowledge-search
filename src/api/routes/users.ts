import { Hono } from 'hono'

const users = new Hono()

// Mock database
const mockUsers = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com' }
]

// GET /api/users - List all users
users.get('/', (c) => {
    return c.json({ users: mockUsers })
})

// GET /api/users/:id - Get single user
users.get('/:id', (c) => {
    const id = c.req.param('id')
    const user = mockUsers.find(u => u.id === id)

    if (!user) {
        return c.json({ error: 'User not found' }, 404)
    }

    return c.json({ user })
})

// POST /api/users - Create user
users.post('/', async (c) => {
    const body = await c.req.json()
    const newUser = {
        id: String(mockUsers.length + 1),
        ...body
    }

    return c.json({ user: newUser }, 201)
})

// PUT /api/users/:id - Update user
users.put('/:id', async (c) => {
    const id = c.req.param('id')
    const body = await c.req.json()

    return c.json({
        user: { id, ...body },
        updated: true
    })
})

// DELETE /api/users/:id - Delete user
users.delete('/:id', (c) => {
    const id = c.req.param('id')
    return c.json({ deleted: true, id })
})

export default users