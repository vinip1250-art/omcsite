'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function LojasPage() {
  const [stores, setStores] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingStore, setEditingStore] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    active: true
  })

  useEffect(() => {
    fetchStores()
  }, [])

  const fetchStores = async () => {
    try {
      const res = await fetch('/api/stores')
      const data = await res.json()
      setStores(data)
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const url = editingStore 
        ? `/api/stores/${editingStore.id}`
        : '/api/stores'

      const method = editingStore ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert(editingStore ? 'Loja atualizada!' : 'Loja cadastrada!')
        setShowForm(false)
        setEditingStore(null)
        setFormData({ name: '', active: true })
        fetchStores()
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao salvar loja')
    }
  }

  const handleEdit = (store) => {
    setEditingStore(store)
    setFormData({
      name: store.name,
      active: store.active
    })
    setShowForm(true)
  }

  const handleToggleActive = async (id, currentActive) => {
    try {
      const response = await fetch(`/api/stores/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive })
      })

      if (response.ok) {
        fetchStores()
      }
    } catch (error) {
      alert('Erro ao atualizar status')
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lojas e Clubes</h1>
          <p className="text-gray-600 mt-1">
            Cadastre as lojas onde você faz compras (Fast Shop, Casas Bahia, PagBank, etc)
          </p>
        </div>
        <Button onClick={() => {
          setShowForm(!showForm)
          setEditingStore(null)
          setFormData({ name: '', active: true })
        }}>
          {showForm ? 'Cancelar' : '+ Nova Loja'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingStore ? 'Editar' : 'Nova'} Loja</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nome da Loja/Clube *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Fast Shop, Casas Bahia, PagBank..."
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingStore ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lojas Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                    Nenhuma loja cadastrada
                  </TableCell>
                </TableRow>
              ) : (
                stores.map(store => (
                  <TableRow key={store.id}>
                    <TableCell className="font-medium">{store.name}</TableCell>
                    <TableCell>
                      <Badge variant={store.active ? 'default' : 'secondary'}>
                        {store.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(store.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleEdit(store)}>
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant={store.active ? 'destructive' : 'default'}
                          onClick={() => handleToggleActive(store.id, store.active)}
                        >
                          {store.active ? 'Desativar' : 'Ativar'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-gray-700">
            💡 <strong>Dica:</strong> Depois de cadastrar as lojas, você pode associá-las aos 
            programas de pontos em <a href="/programas" className="text-blue-600 underline">Programas</a>.
            Por exemplo: Fast Shop + Esfera, Casas Bahia + Livelo, etc.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
