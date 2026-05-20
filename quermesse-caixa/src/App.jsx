import { useState, useEffect, useRef } from 'react'
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  IconButton,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Toolbar,
  AppBar,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
  TextField,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel
} from '@mui/material'
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  Clear as ClearIcon,
  Payment as PaymentIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  AccountBalance as AccountBalanceIcon,
  CheckCircle as CheckCircleIcon,
  Money as MoneyIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon
} from '@mui/icons-material'
import './App.css'

const DENOMINATIONS = [20, 10, 5, 2, 1]

function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [currentTab, setCurrentTab] = useState('caixa')
  const [sales, setSales] = useState([])
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [confirmClearDialogOpen, setConfirmClearDialogOpen] = useState(false)
  const [deleteSaleDialogOpen, setDeleteSaleDialogOpen] = useState(false)
  const [saleToDelete, setSaleToDelete] = useState(null)
  const [adminFilter, setAdminFilter] = useState('all')
  const [fichas, setFichas] = useState({ 1: 0, 2: 0, 5: 0, 10: 0, 20: 0 })
  const [changeMode, setChangeMode] = useState('normal')
  const [amountReceived, setAmountReceived] = useState('')
  const [changeDialogOpen, setChangeDialogOpen] = useState(false)
  const [suggestedChange, setSuggestedChange] = useState({})
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null)
  const [directValueDialogOpen, setDirectValueDialogOpen] = useState(false)
  const [directValueInput, setDirectValueInput] = useState('')
  const [fichasSuggestion, setFichasSuggestion] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [addFichaDialogOpen, setAddFichaDialogOpen] = useState(false)
  const [addFichaInput, setAddFichaInput] = useState('')
  const [addFichaType, setAddFichaType] = useState('20')
  const [addRealMoneyDialogOpen, setAddRealMoneyDialogOpen] = useState(false)
  const [addRealMoneyAmount, setAddRealMoneyAmount] = useState('')
  const [addRealMoneyType, setAddRealMoneyType] = useState('deposit')
  const [editSaleDialogOpen, setEditSaleDialogOpen] = useState(false)
  const [saleToEdit, setSaleToEdit] = useState(null)
  const [editSaleTotal, setEditSaleTotal] = useState('')
  const [editSalePaymentMethod, setEditSalePaymentMethod] = useState('')
  const [editingItemId, setEditingItemId] = useState(null)
  const [tempQuantity, setTempQuantity] = useState('')
  const debounceTimeoutRef = useRef(null)
  const inputRefs = useRef({})

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  const handleQuantityChange = (itemId, value) => {
    setEditingItemId(itemId)
    setTempQuantity(value)
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    // Set new timeout to blur after 1 second
    debounceTimeoutRef.current = setTimeout(() => {
      const input = inputRefs.current[itemId]
      if (input) {
        input.blur()
      }
    }, 1000)
  }

  const handleQuantityBlur = (itemId) => {
    const value = parseInt(tempQuantity)
    if (isNaN(value) || value <= 0) {
      removeFromCart(itemId)
    } else {
      updateCartItem(itemId, value)
    }
    setEditingItemId(null)
    setTempQuantity('')
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
  }

  useEffect(() => {
    fetch('./products.json')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Erro ao carregar produtos:', err))
  }, [])

  useEffect(() => {
    const savedSales = localStorage.getItem('quermesse-sales')
    if (savedSales) {
      setSales(JSON.parse(savedSales))
    }
    const savedFichas = localStorage.getItem('quermesse-fichas')
    if (savedFichas) {
      setFichas(JSON.parse(savedFichas))
    }
    const savedChangeMode = localStorage.getItem('quermesse-change-mode')
    if (savedChangeMode) {
      setChangeMode(savedChangeMode)
    }
    const savedTransactions = localStorage.getItem('quermesse-transactions')
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions))
    }
  }, [])

  const saveSalesToStorage = (newSales) => {
    localStorage.setItem('quermesse-sales', JSON.stringify(newSales))
    setSales(newSales)
  }

  const saveFichasToStorage = (newFichas) => {
    localStorage.setItem('quermesse-fichas', JSON.stringify(newFichas))
    setFichas(newFichas)
  }

  const saveTransactionsToStorage = (newTransactions) => {
    localStorage.setItem('quermesse-transactions', JSON.stringify(newTransactions))
    setTransactions(newTransactions)
  }

  const addFichaFromTransaction = () => {
    const denom = parseInt(addFichaType)
    const quantity = parseInt(addFichaInput) || 0
    if (quantity > 0) {
      const newFichas = { ...fichas, [denom]: (fichas[denom] || 0) + quantity }
      saveFichasToStorage(newFichas)

      const transaction = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        type: 'ficha',
        subType: 'entrada',
        denomination: denom,
        quantity,
        total: denom * quantity
      }
      const newTransactions = [...transactions, transaction]
      saveTransactionsToStorage(newTransactions)

      setAddFichaInput('')
      setAddFichaDialogOpen(false)
    }
  }

  const addRealMoneyTransaction = () => {
    const amount = parseFloat(addRealMoneyAmount) || 0
    if (amount > 0) {
      const transaction = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        type: 'real',
        subType: addRealMoneyType,
        amount
      }
      const newTransactions = [...transactions, transaction]
      saveTransactionsToStorage(newTransactions)

      setAddRealMoneyAmount('')
      setAddRealMoneyDialogOpen(false)
    }
  }

  const deleteTransaction = (transactionId) => {
    const newTransactions = transactions.filter(t => t.id !== transactionId)

    // If it was a ficha entrada, remove the fichas
    const transaction = transactions.find(t => t.id === transactionId)
    if (transaction && transaction.type === 'ficha' && transaction.subType === 'entrada') {
      const newFichas = { ...fichas }
      newFichas[transaction.denomination] = Math.max(0, (newFichas[transaction.denomination] || 0) - transaction.quantity)
      saveFichasToStorage(newFichas)
    }

    saveTransactionsToStorage(newTransactions)
  }

  const clearAllTransactions = () => {
    setTransactions([])
    localStorage.removeItem('quermesse-transactions')
  }

  const categories = ['Todos', ...new Set(products.map(p => p.category))]

  const filteredProducts = selectedCategory === 'Todos'
    ? products
    : products.filter(p => p.category === selectedCategory)

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateCartItem = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id)
      return
    }
    setCart(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const clearCart = () => {
    setCart([])
  }

  const addDirectValueToCart = () => {
    const value = parseFloat(directValueInput)
    if (value && value > 0) {
      const directItem = {
        id: 'direct-' + Date.now(),
        name: 'Valor Direto',
        price: value,
        category: 'Direto',
        quantity: 1
      }
      setCart(prev => [...prev, directItem])
      setDirectValueInput('')
      setDirectValueDialogOpen(false)
    }
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleFinalizarVenda = () => {
    if (cart.length === 0) return
    setPaymentDialogOpen(true)
  }

  const handleDinheiroPayment = () => {
    setPaymentDialogOpen(false)
    setAmountReceived('')
    setChangeDialogOpen(true)
  }

  const calculateChange = (amount, mode, availableFichas) => {
    const result = { 1: 0, 2: 0, 5: 0, 10: 0, 20: 0 }
    let remaining = Math.round(amount * 100) // Work with cents
    const fichasCopy = { ...availableFichas }

    if (mode === 'privilegiar_troco') {
      // Prefer 5s and 2s first for better future change
      const preferred = [5, 2, 10, 20, 1]
      for (const denom of preferred) {
        const count = Math.min(remaining / (denom * 100), fichasCopy[denom])
        result[denom] = Math.floor(count)
        remaining -= result[denom] * denom * 100
        fichasCopy[denom] -= result[denom]
      }
    } else {
      // Normal mode: greedy with largest bills first
      for (const denom of DENOMINATIONS) {
        const count = Math.min(remaining / (denom * 100), fichasCopy[denom])
        result[denom] = Math.floor(count)
        remaining -= result[denom] * denom * 100
        fichasCopy[denom] -= result[denom]
      }
    }

    // If we couldn't make exact change, try to use remaining bills (low number of cells approach)
    if (remaining > 0) {
      for (const denom of DENOMINATIONS.sort((a, b) => b - a)) {
        while (remaining >= denom * 100 && fichasCopy[denom] > 0) {
          result[denom]++
          remaining -= denom * 100
          fichasCopy[denom]--
        }
      }
    }

    // Calculate total change value (actual amount that can be given)
    const totalChange = Object.entries(result).reduce((sum, [denom, count]) => {
      return sum + (parseInt(denom) * count)
    }, 0)

    // Calculate the shortage (amount that couldn't be given)
    const requiredChange = amount
    const shortage = Math.max(0, requiredChange - totalChange)

    return { result, totalChange, remaining, shortage }
  }

  const calculateReceivedBills = (amount) => {
    // For received amount, use greedy with largest bills
    const result = { 1: 0, 2: 0, 5: 0, 10: 0, 20: 0 }
    let remaining = Math.round(amount * 100)

    for (const denom of DENOMINATIONS) {
      const count = Math.floor(remaining / (denom * 100))
      result[denom] = count
      remaining -= count * denom * 100
    }

    return result
  }

  const calculateBillSuggestion = (amount) => {
    // Calculate bill breakdown based on available fichas
    const { result, totalChange, remaining } = calculateChange(amount, changeMode, fichas)
    return { result, totalValue: totalChange, remaining }
  }

  const handleAmountReceivedChange = (value) => {
    setAmountReceived(value)
    const received = parseFloat(value) || 0
    if (received >= total) {
      const changeAmount = received - total
      const { result, totalChange, remaining } = calculateChange(changeAmount, changeMode, fichas)
      setSuggestedChange({ result, totalChange, remaining })
    } else {
      setSuggestedChange({})
    }
  }

  const confirmSale = (paymentMethod) => {
    setSelectedPaymentMethod(paymentMethod)

    if (paymentMethod === 'Dinheiro') {
      handleDinheiroPayment()
    } else {
      // For Pix and Cartão, calculate fichas to give
      const suggestion = calculateBillSuggestion(total)
      setFichasSuggestion(suggestion)
      setPaymentDialogOpen(false)
    }
  }

  const getLowFichasWarnings = () => {
    const warnings = []
    for (const denom of DENOMINATIONS) {
      if (fichas[denom] > 0 && fichas[denom] <= 7) {
        warnings.push(denom)
      }
    }
    return warnings
  }

  const lowFichasWarnings = getLowFichasWarnings()

  const confirmFichasSale = () => {
    // Update fichas: subtract fichas given
    const newFichas = { ...fichas }
    for (const denom of DENOMINATIONS) {
      newFichas[denom] = Math.max(0, (newFichas[denom] || 0) - (fichasSuggestion.result[denom] || 0))
    }
    saveFichasToStorage(newFichas)

    const sale = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      items: [...cart],
      total,
      paymentMethod: selectedPaymentMethod,
      fichasGiven: fichasSuggestion.result
    }
    const newSales = [...sales, sale]
    saveSalesToStorage(newSales)

    clearCart()
    setFichasSuggestion(null)
    setSelectedPaymentMethod(null)
  }

  const confirmDinheiroSale = () => {
    const received = parseFloat(amountReceived)
    const changeAmount = received - total

    // Update fichas: subtract fichas given as change
    const newFichas = { ...fichas }
    for (const denom of DENOMINATIONS) {
      newFichas[denom] = Math.max(0, (newFichas[denom] || 0) - (suggestedChange.result[denom] || 0))
    }
    saveFichasToStorage(newFichas)

    const sale = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      items: [...cart],
      total,
      paymentMethod: 'Dinheiro',
      amountReceived: received,
      change: changeAmount,
      fichasGiven: suggestedChange.result
    }
    const newSales = [...sales, sale]
    saveSalesToStorage(newSales)

    clearCart()
    setChangeDialogOpen(false)
    setAmountReceived('')
    setSuggestedChange({})
    setSelectedPaymentMethod(null)
  }

  const openDeleteSaleDialog = (sale) => {
    setSaleToDelete(sale)
    setDeleteSaleDialogOpen(true)
  }

  const confirmDeleteSale = () => {
    if (saleToDelete) {
      const newSales = sales.filter(sale => sale.id !== saleToDelete.id)
      saveSalesToStorage(newSales)
      setSaleToDelete(null)
      setDeleteSaleDialogOpen(false)
    }
  }

  const deleteSale = (saleId) => {
    openDeleteSaleDialog(sales.find(s => s.id === saleId))
  }

  const openEditSaleDialog = (sale) => {
    setSaleToEdit(sale)
    setEditSaleTotal(sale.total.toString())
    setEditSalePaymentMethod(sale.paymentMethod)
    setEditSaleDialogOpen(true)
  }

  const confirmEditSale = () => {
    if (saleToEdit && editSaleTotal) {
      const newTotal = parseFloat(editSaleTotal)
      if (newTotal > 0) {
        const newSales = sales.map(sale =>
          sale.id === saleToEdit.id
            ? { ...sale, total: newTotal, paymentMethod: editSalePaymentMethod }
            : sale
        )
        saveSalesToStorage(newSales)
        setSaleToEdit(null)
        setEditSaleTotal('')
        setEditSalePaymentMethod('')
        setEditSaleDialogOpen(false)
      }
    }
  }

  const clearAllSales = () => {
    setSales([])
    localStorage.removeItem('quermesse-sales')
    setConfirmClearDialogOpen(false)
  }

  const updateFicha = (denom, delta) => {
    const newFichas = { ...fichas }
    newFichas[denom] = Math.max(0, (newFichas[denom] || 0) + delta)
    saveFichasToStorage(newFichas)
  }

  const resetFichas = () => {
    const emptyFichas = { 1: 0, 2: 0, 5: 0, 10: 0, 20: 0 }
    saveFichasToStorage(emptyFichas)
  }

  const handleChangeModeChange = (event) => {
    const newMode = event.target.value
    setChangeMode(newMode)
    localStorage.setItem('quermesse-change-mode', newMode)
    // Recalculate change if dialog is open
    if (amountReceived && parseFloat(amountReceived) >= total) {
      handleAmountReceivedChange(amountReceived)
    }
  }

  const filteredSales = adminFilter === 'all'
    ? [...sales].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    : [...sales]
        .filter(sale => sale.paymentMethod.toLowerCase() === adminFilter)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  const overallTotal = sales.reduce((sum, sale) => sum + sale.total, 0)

  const totalsByType = {
    pix: sales.filter(s => s.paymentMethod === 'Pix').reduce((sum, s) => sum + s.total, 0),
    cartao: sales.filter(s => s.paymentMethod === 'Cartão').reduce((sum, s) => sum + s.total, 0),
    dinheiro: sales.filter(s => s.paymentMethod === 'Dinheiro').reduce((sum, s) => sum + s.total, 0)
  }

  const formatDateTime = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'Pix': return 'success'
      case 'Cartão': return 'info'
      case 'Dinheiro': return 'warning'
      default: return 'default'
    }
  }

  const totalFichasValue = Object.entries(fichas).reduce((sum, [denom, count]) => {
    return sum + (parseInt(denom) * count)
  }, 0)

  return (
    <div className="app-container">
      <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #5D4037 0%, #4A3728 100%)' }}>
        <Toolbar>
          <ShoppingCartIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Quermesse Caixa
          </Typography>
          <Button
            variant="outlined"
            size="small"
            color="inherit"
            onClick={() => setConfirmClearDialogOpen(true)}
            startIcon={<RefreshIcon />}
            sx={{ borderColor: 'rgba(255,255,255,0.3)', '&:hover': { borderColor: 'white' } }}
          >
            Novo Dia
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            centered
          >
            <Tab
              value="caixa"
              label={
                <Badge badgeContent={null} color="primary">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShoppingCartIcon />
                    Caixa
                  </Box>
                </Badge>
              }
            />
            <Tab
              value="historico"
              label={
                <Badge badgeContent={sales.length} color="secondary">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssessmentIcon />
                    Histórico de Vendas
                  </Box>
                </Badge>
              }
            />
            <Tab
              value="entradas"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MoneyIcon />
                  Entradas/Saída
                </Box>
              }
            />
            <Tab
              value="fichas"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountBalanceIcon />
                  Fichas
                </Box>
              }
            />
          </Tabs>
        </Paper>

        {currentTab === 'caixa' ? (
          <Grid container spacing={3}>
            {/* Product Grid */}
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {categories.map(category => (
                  <Chip
                    key={category}
                    label={category}
                    onClick={() => setSelectedCategory(category)}
                    color={selectedCategory === category ? 'primary' : 'default'}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>

              <Grid container spacing={2}>
                {filteredProducts.map(product => (
                  <Grid item xs={12} sm={6} md={4} key={product.id}>
                    <Card
                      className="product-card"
                      onClick={() => addToCart(product)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            {product.name}
                          </Typography>
                          <span className="price-tag">
                            R$ {product.price.toFixed(2)}
                          </span>
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {product.description}
                        </Typography>
                        <Chip
                          label={product.category}
                          size="small"
                          variant="outlined"
                          sx={{ mt: 1 }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Cart Panel */}
            <Grid item xs={12} md={4}>
              <Paper className="cart-paper" elevation={3} sx={{ position: 'sticky', top: 80 }}>
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Carrinho
                    </Typography>
                    {cart.length > 0 && (
                      <IconButton
                        onClick={clearCart}
                        size="small"
                        color="error"
                        title="Limpar carrinho"
                      >
                        <ClearIcon />
                      </IconButton>
                    )}
                  </Box>

                  {/* Direct Value Button */}
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setDirectValueDialogOpen(true)}
                    sx={{ mb: 2 }}
                  >
                    Adicionar Valor Direto
                  </Button>

                  {cart.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                      <ShoppingCartIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                      <Typography>Carrinho vazio</Typography>
                    </Box>
                  ) : (
                    <>
                      <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                        {cart.map(item => (
                          <ListItem key={item.id} className="cart-item">
                            <ListItemText
                              primary={item.name}
                              secondary={`R$ ${item.price.toFixed(2)}${item.category !== 'Direto' ? ' cada' : ''}`}
                            />
                            {item.category !== 'Direto' ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
                                <IconButton
                                  size="small"
                                  onClick={() => updateCartItem(item.id, item.quantity - 1)}
                                >
                                  <RemoveIcon fontSize="small" />
                                </IconButton>
                                <TextField
                                  type="number"
                                  value={editingItemId === item.id ? tempQuantity : item.quantity}
                                  onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                  onBlur={() => handleQuantityBlur(item.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.target.blur()
                                    }
                                  }}
                                  inputProps={{ min: 1, style: { textAlign: 'center' } }}
                                  inputRef={(el) => inputRefs.current[item.id] = el}
                                  size="small"
                                  sx={{ width: 60 }}
                                />
                                <IconButton
                                  size="small"
                                  onClick={() => updateCartItem(item.id, item.quantity + 1)}
                                >
                                  <AddIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            ) : (
                              <Box sx={{ mr: 2 }}>
                                <Chip label="Único" size="small" variant="outlined" />
                              </Box>
                            )}
                            <Typography sx={{ minWidth: 70, textAlign: 'right', fontWeight: 600 }}>
                              R$ {(item.price * item.quantity).toFixed(2)}
                            </Typography>
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                onClick={() => removeFromCart(item.id)}
                                size="small"
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>

                      <Divider sx={{ my: 2 }} />

                      <div className="total-section">
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6">
                            Total:
                          </Typography>
                          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            R$ {total.toFixed(2)}
                          </Typography>
                        </Box>
                      </div>

                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        sx={{
                          mt: 2,
                          background: 'linear-gradient(135deg, #5D4037 0%, #4A3728 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #4A3728 0%, #3E2723 100%)'
                          }
                        }}
                        onClick={handleFinalizarVenda}
                        startIcon={<PaymentIcon />}
                      >
                        Finalizar Venda
                      </Button>
                    </>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Low Fichas Warning */}
            {lowFichasWarnings.length > 0 && (
              <Grid item xs={12}>
                <Box sx={{
                  p: 1,
                  bgcolor: '#EFEBE9',
                  color: '#5D4037',
                  borderRadius: 1,
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <WarningIcon sx={{ fontSize: '1rem' }} />
                  <span>Fichas acabando: {lowFichasWarnings.map(d => `R$ ${d} (${fichas[d]})`).join(', ')}</span>
                </Box>
              </Grid>
            )}
          </Grid>
        ) : currentTab === 'historico' ? (
          /* Histórico de Vendas Panel */
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                  <Typography variant="h5">
                    Histórico de Vendas
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label="Todos"
                      onClick={() => setAdminFilter('all')}
                      color={adminFilter === 'all' ? 'primary' : 'default'}
                      sx={{ cursor: 'pointer' }}
                    />
                    <Chip
                      label="Pix"
                      onClick={() => setAdminFilter('pix')}
                      color={adminFilter === 'pix' ? 'success' : 'default'}
                      sx={{ cursor: 'pointer' }}
                    />
                    <Chip
                      label="Cartão"
                      onClick={() => setAdminFilter('cartao')}
                      color={adminFilter === 'cartao' ? 'info' : 'default'}
                      sx={{ cursor: 'pointer' }}
                    />
                    <Chip
                      label="Dinheiro"
                      onClick={() => setAdminFilter('dinheiro')}
                      color={adminFilter === 'dinheiro' ? 'warning' : 'default'}
                      sx={{ cursor: 'pointer' }}
                    />
                  </Box>
                </Box>

                {/* Totals Breakdown */}
                <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, bgcolor: '#8D6E63', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', minHeight: 100 }}>
                      <Typography variant="body2">Total</Typography>
                      <Typography variant="h5">R$ {overallTotal.toFixed(2)}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, bgcolor: '#A1887F', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', minHeight: 100 }}>
                      <Typography variant="body2">Total Pix</Typography>
                      <Typography variant="h5">R$ {totalsByType.pix.toFixed(2)}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, bgcolor: '#BCAAA4', color: '#3E2723', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', minHeight: 100 }}>
                      <Typography variant="body2">Total Cartão</Typography>
                      <Typography variant="h5">R$ {totalsByType.cartao.toFixed(2)}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, bgcolor: '#D7CCC8', color: '#3E2723', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', minHeight: 100 }}>
                      <Typography variant="body2">Total Dinheiro</Typography>
                      <Typography variant="h5">R$ {totalsByType.dinheiro.toFixed(2)}</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {sales.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                    <AssessmentIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6">Nenhuma venda registrada</Typography>
                  </Box>
                ) : (
                  <>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Data/Hora</TableCell>
                            <TableCell>Forma de Pagamento</TableCell>
                            <TableCell align="right">Total</TableCell>
                            <TableCell align="right">Ações</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredSales.map((sale) => (
                            <TableRow key={sale.id} hover>
                              <TableCell>{formatDateTime(sale.timestamp)}</TableCell>
                              <TableCell>
                                <Chip
                                  label={sale.paymentMethod}
                                  color={getPaymentMethodColor(sale.paymentMethod)}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>
                                R$ {sale.total.toFixed(2)}
                              </TableCell>
                              <TableCell align="right">
                                <IconButton
                                  onClick={() => openEditSaleDialog(sale)}
                                  color="primary"
                                  size="small"
                                  title="Editar venda"
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  onClick={() => deleteSale(sale.id)}
                                  color="error"
                                  size="small"
                                  title="Excluir venda"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Divider sx={{ my: 3 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<ClearIcon />}
                        onClick={() => setConfirmClearDialogOpen(true)}
                      >
                        Limpar Tudo
                      </Button>
                    </Box>
                  </>
                )}
              </Paper>
            </Grid>
          </Grid>
        ) : currentTab === 'entradas' ? (
          /* Entradas/Saída Panel */
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                  <Typography variant="h5">
                    Entradas e Saídas
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setAddFichaDialogOpen(true)
                        setAddFichaInput('')
                        setAddFichaType('20')
                      }}
                    >
                      Adicionar Fichas
                    </Button>
                    <Button
                      variant="outlined"
                      color="success"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setAddRealMoneyDialogOpen(true)
                        setAddRealMoneyAmount('')
                        setAddRealMoneyType('deposit')
                      }}
                    >
                      Entrada Dinheiro
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<RemoveIcon />}
                      onClick={() => {
                        setAddRealMoneyDialogOpen(true)
                        setAddRealMoneyAmount('')
                        setAddRealMoneyType('withdraw')
                      }}
                    >
                      Passagem/Saída Dinheiro
                    </Button>
                  </Box>
                </Box>

                {/* Summary Cards */}
                <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
                  {/* <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, bgcolor: '#A1887F', color: 'white' }}>
                      <Typography variant="body2">Fichas Adicionadas</Typography>
                      <Typography variant="h5">
                        {transactions.filter(t => t.type === 'ficha' && t.subType === 'entrada').length}
                      </Typography>
                    </Paper>
                  </Grid> */}
                  <Grid item xs={12} sm={4} md={4}>
                    <Paper sx={{ p: 2, bgcolor: '#BCAAA4', color: '#3E2723', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', minHeight: 100 }}>
                      <Typography variant="body2">Total Fichas Entradas</Typography>
                      <Typography variant="h5">
                        R$ {transactions.filter(t => t.type === 'ficha' && t.subType === 'entrada').reduce((sum, t) => sum + t.total, 0).toFixed(2)}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4} md={4}>
                    <Paper sx={{ p: 2, bgcolor: '#5D4037', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', minHeight: 100 }}>
                      <Typography variant="body2">Entradas Dinheiro Real</Typography>
                      <Typography variant="h5">
                        R$ {transactions.filter(t => t.type === 'real' && t.subType === 'deposit').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4} md={4}>
                    <Paper sx={{ p: 2, bgcolor: '#3E2723', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', minHeight: 100 }}>
                      <Typography variant="body2">Saídas Dinheiro Real</Typography>
                      <Typography variant="h5">
                        R$ {transactions.filter(t => t.type === 'real' && t.subType === 'withdraw').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {transactions.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
                    <MoneyIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6">Nenhuma transação registrada</Typography>
                  </Box>
                ) : (
                  <>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Data/Hora</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell>Descrição</TableCell>
                            <TableCell align="right">Valor</TableCell>
                            <TableCell align="right">Ações</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {[...transactions].reverse().map((transaction) => (
                            <TableRow key={transaction.id} hover>
                              <TableCell>{formatDateTime(transaction.timestamp)}</TableCell>
                              <TableCell>
                                {transaction.type === 'ficha' ? (
                                  <Chip label="Ficha" color="info" size="small" />
                                ) : transaction.subType === 'deposit' ? (
                                  <Chip label="Entrada" color="success" size="small" />
                                ) : (
                                  <Chip label="Saída" color="error" size="small" />
                                )}
                              </TableCell>
                              <TableCell>
                                {transaction.type === 'ficha' ? (
                                  `${transaction.quantity}x Ficha R$ ${transaction.denomination}`
                                ) : transaction.subType === 'deposit' ? (
                                  'Entrada de dinheiro real'
                                ) : (
                                  'Saída de dinheiro real'
                                )}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>
                                {transaction.type === 'ficha' ? (
                                  <>+R$ {transaction.total.toFixed(2)}</>
                                ) : transaction.subType === 'deposit' ? (
                                  <>+R$ {transaction.amount.toFixed(2)}</>
                                ) : (
                                  <>-R$ {transaction.amount.toFixed(2)}</>
                                )}
                              </TableCell>
                              <TableCell align="right">
                                <IconButton
                                  onClick={() => deleteTransaction(transaction.id)}
                                  color="error"
                                  size="small"
                                  title="Excluir transação"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Divider sx={{ my: 3 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<ClearIcon />}
                        onClick={() => setConfirmClearDialogOpen(true)}
                      >
                        Limpar Tudo
                      </Button>
                    </Box>
                  </>
                )}
              </Paper>
            </Grid>
          </Grid>
        ) : currentTab === 'fichas' ? (
          /* Fichas Panel */
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <MoneyIcon />
                  Controle de Fichas
                </Typography>

                <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
                  <FormLabel component="legend">Modo de Troco</FormLabel>
                  <RadioGroup
                    row
                    value={changeMode}
                    onChange={handleChangeModeChange}
                  >
                    <FormControlLabel
                      value="normal"
                      control={<Radio />}
                      label="Normal (maiores notas primeiro)"
                    />
                    <FormControlLabel
                      value="privilegiar_troco"
                      control={<Radio />}
                      label="Privilegiar Troco (mais 5 e 2)"
                    />
                  </RadioGroup>
                </FormControl>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" sx={{ mb: 2 }}>
                  Quantidade de Cédulas:
                </Typography>

                {DENOMINATIONS.map((denom) => (
                  <Box key={denom} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body1" sx={{ minWidth: 80 }}>
                      R$ {denom}
                    </Typography>
                    <TextField
                      type="number"
                      value={fichas[denom] === 0 ? '' : fichas[denom]}
                      placeholder="0"
                      onChange={(e) => {
                        const rawValue = e.target.value
                        if (rawValue === '' || rawValue === '0') {
                          const newFichas = { ...fichas, [denom]: 0 }
                          setFichas(newFichas)
                          localStorage.setItem('quermesse-fichas', JSON.stringify(newFichas))
                        } else {
                          const value = parseInt(rawValue)
                          if (!isNaN(value) && value >= 0) {
                            const newFichas = { ...fichas, [denom]: value }
                            setFichas(newFichas)
                            localStorage.setItem('quermesse-fichas', JSON.stringify(newFichas))
                          }
                        }
                      }}
                      inputProps={{ min: 0 }}
                      size="small"
                      sx={{ width: 80 }}
                    />
                  </Box>
                ))}

                <Divider sx={{ my: 3 }} />

                <Paper sx={{ p: 3, bgcolor: '#8D6E63', color: 'white', mb: 3 }}>
                  <Typography variant="body2">Total em Fichas:</Typography>
                  <Typography variant="h4">R$ {totalFichasValue.toFixed(2)}</Typography>
                </Paper>

                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<ClearIcon />}
                  onClick={resetFichas}
                >
                  Resetar Fichas
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ mb: 3 }}>
                  Resumo por Valor
                </Typography>

                {DENOMINATIONS.map((denom) => (
                  <Box key={denom} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {fichas[denom] || 0}x R$ {denom}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total: R$ {((fichas[denom] || 0) * denom).toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{
                      width: 50,
                      height: 50,
                      bgcolor: denom >= 10 ? '#A1887F' : denom >= 5 ? '#BCAAA4' : '#D7CCC8',
                      color: denom >= 10 ? 'white' : '#3E2723',
                      color: 'white',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '1.2rem'
                    }}>
                      {denom}
                    </Box>
                  </Box>
                ))}
              </Paper>
            </Grid>
          </Grid>
        ): ''}
      </Container>

      {/* Direct Value Dialog */}
      <Dialog open={directValueDialogOpen} onClose={() => setDirectValueDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddIcon color="primary" />
            Adicionar Valor Direto
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Digite o valor quando o cliente informar apenas o valor, sem especificar os itens.
          </Typography>
          <TextField
            fullWidth
            label="Valor"
            type="number"
            value={directValueInput}
            onChange={(e) => setDirectValueInput(e.target.value)}
            inputProps={{ step: '0.01', min: 0 }}
            autoFocus
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDirectValueDialogOpen(false)
            setDirectValueInput('')
          }}>Cancelar</Button>
          <Button
            onClick={addDirectValueToCart}
            variant="contained"
            disabled={!directValueInput || parseFloat(directValueInput) <= 0}
          >
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fichas Suggestion Dialog for Pix/Cartão */}
      <Dialog open={fichasSuggestion !== null} onClose={() => setFichasSuggestion(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MoneyIcon color="primary" />
            Confirmar Venda - {selectedPaymentMethod}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Total: <strong>R$ {total.toFixed(2)}</strong>
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" color="text.secondary" gutterBottom>
            Fichas a entregar ({changeMode === 'privilegiar_troco' ? 'Privilegiar' : 'Normal'}):
          </Typography>

          <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {fichasSuggestion && DENOMINATIONS.map((denom) => {
                const count = fichasSuggestion.result[denom] || 0
                if (count > 0) {
                  return (
                    <Chip
                      key={denom}
                      label={`${count}x Ficha R$ ${denom}`}
                      color="primary"
                      variant="outlined"
                    />
                  )
                }
                return null
              })}
            </Box>
            {fichasSuggestion && fichasSuggestion.remaining > 0 && (
              <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                Faltam R$ {(fichasSuggestion.remaining / 100).toFixed(2)} em fichas (será dado o máximo possível)
              </Typography>
            )}
          </Paper>

          <Typography variant="body2" color="text.secondary">
            Fichas serão retiradas do caixa.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFichasSuggestion(null)}>Cancelar</Button>
          <Button
            onClick={confirmFichasSale}
            color="success"
            variant="contained"
            startIcon={<CheckCircleIcon />}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Method Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaymentIcon color="primary" />
            Forma de Pagamento
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Total a pagar: <strong>R$ {total.toFixed(2)}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Selecione a forma de pagamento:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => confirmSale('Pix')}
              sx={{ justifyContent: 'flex-start', py: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
                <Typography>Pix</Typography>
                <Chip label="Recomendado" size="small" color="success" />
              </Box>
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => confirmSale('Cartão')}
              sx={{ justifyContent: 'flex-start', py: 2 }}
            >
              <Typography>Cartão</Typography>
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => confirmSale('Dinheiro')}
              sx={{ justifyContent: 'flex-start', py: 2 }}
            >
              <Typography>Dinheiro</Typography>
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      {/* Change Dialog for Dinheiro */}
      <Dialog open={changeDialogOpen} onClose={() => setChangeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MoneyIcon color="primary" />
            Pagamento em Dinheiro
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Total a pagar: <strong>R$ {total.toFixed(2)}</strong>
          </Typography>

          <TextField
            fullWidth
            label="Valor Recebido"
            type="number"
            value={amountReceived}
            onChange={(e) => handleAmountReceivedChange(e.target.value)}
            inputProps={{ step: '0.01', min: 0 }}
            autoFocus
            sx={{ mt: 2 }}
          />

          {amountReceived && parseFloat(amountReceived) >= total ? (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon />
                Troco: R$ {(parseFloat(amountReceived) - total).toFixed(2)}
              </Typography>

              {suggestedChange.result && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Fichas a entregar ({changeMode === 'privilegiar_troco' ? 'Privilegiar' : 'Normal'}):
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {DENOMINATIONS.map((denom) => {
                      const count = suggestedChange.result[denom] || 0
                      if (count > 0) {
                        return (
                          <Chip
                            key={denom}
                            label={`${count}x Ficha R$ ${denom}`}
                            color="success"
                            variant="outlined"
                          />
                        )
                      }
                      return null
                    })}
                  </Box>
                  {suggestedChange.remaining > 0 && (
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                      Faltam R$ {(suggestedChange.remaining / 100).toFixed(2)} em fichas (será dado o máximo possível)
                    </Typography>
                  )}
                </Box>
              )}
            </>
          ) : amountReceived && parseFloat(amountReceived) < total ? (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              Valor insuficiente. Faltam R$ {(total - parseFloat(amountReceived)).toFixed(2)}
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setChangeDialogOpen(false)
            setAmountReceived('')
            setSuggestedChange({})
            setSelectedPaymentMethod(null)
          }}>Cancelar</Button>
          <Button
            onClick={confirmDinheiroSale}
            color="success"
            variant="contained"
            disabled={!amountReceived || parseFloat(amountReceived) < total || !suggestedChange.result}
            startIcon={<CheckCircleIcon />}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Clear Dialog / Novo Dia */}
      <Dialog open={confirmClearDialogOpen} onClose={() => setConfirmClearDialogOpen(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.main' }}>
            <RefreshIcon />
            Novo Dia - Confirmar
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja iniciar um novo dia? Isso limpará todas as vendas, transações e fichas. Esta ação não pode ser desfeita.
          </Typography>
          {(sales.length > 0 || transactions.length > 0) && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {sales.length} venda(s) serão excluída(s).
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {transactions.length} transação(ões) serão excluída(s).
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClearDialogOpen(false)}>Cancelar</Button>
          <Button onClick={() => {
            // Clear everything
            setSales([])
            setTransactions([])
            setFichas({ 1: 0, 2: 0, 5: 0, 10: 0, 20: 0 })
            localStorage.removeItem('quermesse-sales')
            localStorage.removeItem('quermesse-transactions')
            localStorage.removeItem('quermesse-fichas')
            setConfirmClearDialogOpen(false)
          }} color="error" variant="contained" startIcon={<RefreshIcon />}>
            Sim, Iniciar Novo Dia
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Single Sale Dialog */}
      <Dialog open={deleteSaleDialogOpen} onClose={() => setDeleteSaleDialogOpen(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.main' }}>
            <WarningIcon />
            Confirmar Exclusão
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita.
          </Typography>
          {saleToDelete && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Data:</strong> {formatDateTime(saleToDelete.timestamp)}
              </Typography>
              <Typography variant="body2">
                <strong>Total:</strong> R$ {saleToDelete.total.toFixed(2)}
              </Typography>
              <Typography variant="body2">
                <strong>Pagamento:</strong> {saleToDelete.paymentMethod}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteSaleDialogOpen(false)}>Cancelar</Button>
          <Button onClick={confirmDeleteSale} color="error" variant="contained">
            Sim, Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Sale Dialog */}
      <Dialog open={editSaleDialogOpen} onClose={() => setEditSaleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon color="primary" />
            Editar Venda
          </Box>
        </DialogTitle>
        <DialogContent>
          {saleToEdit && (
            <>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Data: {formatDateTime(saleToEdit.timestamp)}
              </Typography>
              <TextField
                fullWidth
                label="Novo Total"
                type="number"
                value={editSaleTotal}
                onChange={(e) => setEditSaleTotal(e.target.value)}
                inputProps={{ step: '0.01', min: 0.01 }}
                sx={{ mt: 2 }}
              />
              <FormControl fullWidth sx={{ mt: 2 }}>
                <FormLabel>Nova Forma de Pagamento</FormLabel>
                <RadioGroup
                  value={editSalePaymentMethod}
                  onChange={(e) => setEditSalePaymentMethod(e.target.value)}
                >
                  <FormControlLabel value="Pix" control={<Radio />} label="Pix" />
                  <FormControlLabel value="Cartão" control={<Radio />} label="Cartão" />
                  <FormControlLabel value="Dinheiro" control={<Radio />} label="Dinheiro" />
                </RadioGroup>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditSaleDialogOpen(false)
            setSaleToEdit(null)
            setEditSaleTotal('')
            setEditSalePaymentMethod('')
          }}>Cancelar</Button>
          <Button
            onClick={confirmEditSale}
            variant="contained"
            disabled={!editSaleTotal || parseFloat(editSaleTotal) <= 0}
            startIcon={<EditIcon />}
          >
            Salvar Alterações
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Ficha Dialog */}
      <Dialog open={addFichaDialogOpen} onClose={() => setAddFichaDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddIcon color="primary" />
            Adicionar Fichas
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Adicione fichas ao caixa. Isso sincronizará automaticamente com a aba Fichas.
          </Typography>
          <TextField
            fullWidth
            label="Quantidade"
            type="number"
            value={addFichaInput}
            onChange={(e) => setAddFichaInput(e.target.value)}
            inputProps={{ min: 1 }}
            autoFocus
            sx={{ mt: 2 }}
          />
          <FormControl fullWidth sx={{ mt: 2 }}>
            <FormLabel>Valor da Ficha</FormLabel>
            <RadioGroup
              row
              value={addFichaType}
              onChange={(e) => setAddFichaType(e.target.value)}
            >
              <FormControlLabel value="20" control={<Radio />} label="R$ 20" />
              <FormControlLabel value="10" control={<Radio />} label="R$ 10" />
              <FormControlLabel value="5" control={<Radio />} label="R$ 5" />
              <FormControlLabel value="2" control={<Radio />} label="R$ 2" />
              <FormControlLabel value="1" control={<Radio />} label="R$ 1" />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAddFichaDialogOpen(false)
            setAddFichaInput('')
          }}>Cancelar</Button>
          <Button
            onClick={addFichaFromTransaction}
            variant="contained"
            disabled={!addFichaInput || parseInt(addFichaInput) <= 0}
          >
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Real Money Dialog */}
      <Dialog open={addRealMoneyDialogOpen} onClose={() => setAddRealMoneyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {addRealMoneyType === 'deposit' ? <AddIcon color="success" /> : <RemoveIcon color="error" />}
            {addRealMoneyType === 'deposit' ? 'Entrada de Dinheiro Real' : 'Saída de Dinheiro Real'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Valor"
            type="number"
            value={addRealMoneyAmount}
            onChange={(e) => setAddRealMoneyAmount(e.target.value)}
            inputProps={{ step: '0.01', min: 0.01 }}
            autoFocus
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAddRealMoneyDialogOpen(false)
            setAddRealMoneyAmount('')
          }}>Cancelar</Button>
          <Button
            onClick={addRealMoneyTransaction}
            variant="contained"
            disabled={!addRealMoneyAmount || parseFloat(addRealMoneyAmount) <= 0}
            color={addRealMoneyType === 'deposit' ? 'success' : 'error'}
          >
            {addRealMoneyType === 'deposit' ? 'Registrar Entrada' : 'Registrar Saída'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default App
