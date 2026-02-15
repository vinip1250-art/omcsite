'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function ProgramasPage() {
  const [programs, setPrograms] = useState([])
  const [stores, setStores] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingProgram, setEditingProgram] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    storeId: '',
    type: 'POINTS',
    active: true
  })

  useEffect(() => {
    fetchPrograms()
    fetchStores()
  }, [])

  const fetchPrograms = async () => {
    try {
      const res = await fetch('/api/programs/all')
      const data = await res.json()
      setPrograms(data)
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  const fetchStores = async () => {
    try {
      const res = await fetch('/api/stores')
      const data = await res.json()
      setStores(data.filter(s => s.active))
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const url = editingProgram 
        ? `/api/programs/${editingProgram.id}`
        : '/api/programs'

      const method = editingProgram ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert(editingProgram ? 'Programa atualizado!' : 'Programa cadastrado!')
        setShowForm(false)
        setEditingProgram(null)
        setFormData({ name: '', storeId: '', type: 'POINTS', active: true })
        fetchPrograms()
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao salvar programa')
    }
  }

  const handleEdit = (program) => {
    setEditingProgram(program)
    setFormData({
      name: program.name,
      storeId: program.storeId || '',
      type: program.type || 'POINTS',
      active: program.active
    })
    setShowForm(true)
  }

  const handleToggleActive = async (id, currentActive) => {
    try {
      const response = await fetch(`/api/programs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive })
      })

      if (response.ok) {
        fetchPrograms()
      }
    } catch (error) {
      alert('Erro ao atualizar status')
    }
  }

  const getStoreName = (storeId) => {
    const store = stores.find(s => s.id === storeId)
    return store?.name || 'N/A'
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Programas de Pontos/Milhas</h1>
          <p className="text-gray-600 mt-1">
            Cadastre os programas e associe às lojas
          </p>
        </div>
        <Button onClick={() => {
          setShowForm(!showForm)
          setEditingProgram(null)
          setFormData({ name: '', storeId: '', type: 'POINTS', active: true })
        }}>
          {showForm ? 'Cancelar' : '+ Novo Programa'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingProgram ? 'Editar' : 'Novo'} Programa</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Programa *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Esfera, Livelo, Smiles..."
                    required
                  />
                </div>
                <div>
                  <Label>Loja/Clube</Label>
                  <Select value={formData.storeId} onValueChange={(value) => setFormData({...formData, storeId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma loja" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map(store => (
                        <SelectItem key={store.id} value={store.id}>
                          {store.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <a href="/lojas" target="_blank" className="text-xs text-blue-600 hover:underline">
                    + Cadastrar nova loja
                  </a>
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="POINTS">Pontos</SelectItem>
                      <SelectItem value="MILES">Milhas</SelectItem>
                      <SelectItem value="CASHBACK">Cashback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editingProgram ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Programas Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Programa</TableHead>
                <TableHead>Loja/Clube</TableHead>
                <TableHead>Nome Completo</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    Nenhum programa cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                programs.map(program => {
                  const storeName = program.store?.name || getStoreName(program.storeId)
                  const fullName = storeName ? `${storeName}/${program.name}` : program.name

                  return (
                    <TableRow key={program.id}>
                      <TableCell className="font-medium">{program.name}</TableCell>
                      <TableCell>{storeName || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{fullName}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {program.type === 'POINTS' ? 'Pontos' : program.type === 'MILES' ? 'Milhas' : 'Cashback'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={program.active ? 'default' : 'secondary'}>
                          {program.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleEdit(program)}>
                            Editar
                          </Button>
                          <Button 
                            size="sm" 
                            variant={program.active ? 'destructive' : 'default'}
                            onClick={() => handleToggleActive(program.id, program.active)}
                          >
                            {program.active ? 'Desativar' : 'Ativar'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
