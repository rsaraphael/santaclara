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
  FormLabel,
  CircularProgress
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
  Edit as EditIcon,
  AdminPanelSettings as AdminIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material'
import './App.css'

const DENOMINATIONS = [20, 10, 5, 3, 2, 1]
const API_BASE_URL = import.meta.env.DEV === true ? '/api' : 'https://y7zq0aigy7.execute-api.us-east-1.amazonaws.com/prod'

// Helper functions to handle dates in GMT-3 timezone
const getDateGMT3 = () => {
  const now = new Date()
  // Convert to GMT-3 (Brazil time)
  const offset = -3 // GMT-3
  const gmt3Time = new Date(now.getTime() + (offset * 60 * 60 * 1000))
  const year = gmt3Time.getUTCFullYear()
  const month = String(gmt3Time.getUTCMonth() + 1).padStart(2, '0')
  const day = String(gmt3Time.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getTimestampGMT3 = () => {
  const now = new Date()
  // Convert to GMT-3 (Brazil time)
  const offset = -3 // GMT-3
  const gmt3Time = new Date(now.getTime() + (offset * 60 * 60 * 1000))
  const year = gmt3Time.getUTCFullYear()
  const month = String(gmt3Time.getUTCMonth() + 1).padStart(2, '0')
  const day = String(gmt3Time.getUTCDate()).padStart(2, '0')
  const hours = String(gmt3Time.getUTCHours()).padStart(2, '0')
  const minutes = String(gmt3Time.getUTCMinutes()).padStart(2, '0')
  const seconds = String(gmt3Time.getUTCSeconds()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`
}

// Format date from server (already in GMT-3) to display format
const formatGMT3DateTime = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

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
  const [addFichaQuantities, setAddFichaQuantities] = useState({ 1: '', 2: '', 3: '', 5: '', 10: '', 20: '' })
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

  // Admin / API Integration states
  const [userApiKey, setUserApiKey] = useState('')
  const [userApiKeyExpiry, setUserApiKeyExpiry] = useState(null)
  const [setApiKeyDialogOpen, setSetApiKeyDialogOpen] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [adminAuthenticated, setAdminAuthenticated] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [adminPasswordDialogOpen, setAdminPasswordDialogOpen] = useState(false)
  const [adminData, setAdminData] = useState([])
  const [adminDataSinceBeginning, setAdminDataSinceBeginning] = useState([])
  const [selectedUserDetails, setSelectedUserDetails] = useState(null)
  const [userDetailsDialogOpen, setUserDetailsDialogOpen] = useState(false)
  const [daySalesDialogOpen, setDaySalesDialogOpen] = useState(false)
  const [selectedDaySales, setSelectedDaySales] = useState(null)
  const [loadingAdmin, setLoadingAdmin] = useState(false)
  const [syncStatus, setSyncStatus] = useState('idle')
  const [showApiKey, setShowApiKey] = useState(false)
  const [showAdminPassword, setShowAdminPassword] = useState(false)
  const [userFetchedData, setUserFetchedData] = useState(null)
  const [loadingUserData, setLoadingUserData] = useState(false)

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

  // Clear state if localStorage is empty (fresh start)
  useEffect(() => {
    const hasData = localStorage.getItem('quermesse-sales') ||
                   localStorage.getItem('quermesse-transactions') ||
                   localStorage.getItem('quermesse-fichas')

    if (!hasData) {
      // Ensure we have empty state
      setSales([])
      setTransactions([])
      setFichas({ 1: 0, 2: 0, 5: 0, 10: 0, 20: 0 })
    }
  }, [])

  useEffect(() => {
    // Don't load data if we're in the middle of clearing
    if (localStorage.getItem('quermesse-clearing')) {
      return
    }

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
    // Load API key with expiry check
    const savedApiKey = localStorage.getItem('quermesse-api-key')
    const savedApiKeyExpiry = localStorage.getItem('quermesse-api-key-expiry')
    if (savedApiKey && savedApiKeyExpiry) {
      const expiryTime = parseInt(savedApiKeyExpiry)
      const now = Date.now()
      if (now < expiryTime) {
        setUserApiKey(savedApiKey)
        setUserApiKeyExpiry(expiryTime)
        // Load user fetched data from localStorage (for immediate display)
        const savedUserFetchedData = localStorage.getItem('quermesse-user-fetched-data')
        if (savedUserFetchedData) {
          setUserFetchedData(JSON.parse(savedUserFetchedData))
        }
        // Fetch fresh data from backend
        fetchUserData(savedApiKey)
      } else {
        localStorage.removeItem('quermesse-api-key')
        localStorage.removeItem('quermesse-api-key-expiry')
        localStorage.removeItem('quermesse-user-fetched-data')
      }
    }
  }, [])

  // Keyboard shortcuts for products
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only trigger if in caixa tab and not typing in an input
      if (currentTab !== 'caixa') return
      if (
        document.activeElement.tagName === 'INPUT' ||
        document.activeElement.tagName === 'TEXTAREA'
      ) return

      const key = e.key.toLowerCase()

      // Don't trigger for numbers
      if (/^\d$/.test(key)) return

      // Find product with matching shortcut
      const product = products.find(p => p.shortcut && p.shortcut.toLowerCase() === key)
      if (product) {
        addToCart(product)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentTab, products])

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

  
  // Auto-sync every 3 minutes
  useEffect(() => {
    if (!userApiKey) return

    const syncToAPIWithCurrentData = async () => {
      const today = getDateGMT3()

      // Calculate today's local data
      const todaySales = sales.filter(s => s.timestamp.startsWith(today))
      const todayTransactions = transactions.filter(t => t.timestamp.startsWith(today))

      const localTodayTotals = {
        pix: todaySales.filter(s => s.paymentMethod === 'Pix').reduce((sum, s) => sum + s.total, 0),
        cartao: todaySales.filter(s => s.paymentMethod === 'Cartão').reduce((sum, s) => sum + s.total, 0),
        dinheiro: todaySales.filter(s => s.paymentMethod === 'Dinheiro').reduce((sum, s) => sum + s.total, 0),
        fichas: todayTransactions.filter(t => t.type === 'ficha' && t.subType === 'entrada').reduce((sum, t) => sum + (t.total || 0), 0),
        money: todayTransactions.filter(t => t.type === 'real' && t.subType === 'deposit').reduce((sum, t) => sum + t.amount, 0) - todayTransactions.filter(t => t.type === 'real' && t.subType === 'withdraw').reduce((sum, t) => sum + t.amount, 0)
      }

      // Get backend base
      const backendBase = userFetchedData?.[0] || { transactions: {}, fichas: 0, money: 0 }

      // Combined totals to sync
      const payload = {
        date: today,
        transactions: {
          pix: (backendBase.transactions?.pix || 0) + localTodayTotals.pix,
          cartao: (backendBase.transactions?.cartao || 0) + localTodayTotals.cartao,
          dinheiro: (backendBase.transactions?.dinheiro || 0) + localTodayTotals.dinheiro
        },
        fichas: (backendBase.fichas || 0) + localTodayTotals.fichas,
        money: (backendBase.money || 0) + localTodayTotals.money
      }

      try {
        setSyncStatus('syncing')
        const response = await fetch(`${API_BASE_URL}/transactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': userApiKey
          },
          body: JSON.stringify(payload)
        })

        if (response.ok) {
          setSyncStatus('success')
        } else {
          setSyncStatus('error')
        }
      } catch (error) {
        console.error('Error syncing to API:', error)
        setSyncStatus('error')
      }
    }

    const syncInterval = setInterval(() => {
      syncToAPIWithCurrentData()
    }, 3 * 60 * 1000) // 3 minutes

    return () => clearInterval(syncInterval)
  }, [userApiKey, sales, transactions, userFetchedData])

  // Clear backend data when API key is cleared
  useEffect(() => {
    if (!userApiKey) {
      setUserFetchedData(null)
      setAdminData([])
      setAdminDataSinceBeginning([])
      setAdminAuthenticated(false)
    }
  }, [userApiKey])

  const fetchAdminData = async (date) => {
    if (!adminPassword) return

    try {
      setLoadingAdmin(true)
      const response = await fetch(`${API_BASE_URL}/transactions?day=${date}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': adminPassword
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAdminData(data.data || [])
      } else {
        console.error('Failed to fetch admin data')
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoadingAdmin(false)
    }
  }

  const syncToAPI = async () => {
    if (!userApiKey) return

    const today = getDateGMT3()

    // Calculate today's local data
    const todaySales = sales.filter(s => s.timestamp.startsWith(today))
    const todayTransactions = transactions.filter(t => t.timestamp.startsWith(today))

    const localTodayTotals = {
      pix: todaySales.filter(s => s.paymentMethod === 'Pix').reduce((sum, s) => sum + s.total, 0),
      cartao: todaySales.filter(s => s.paymentMethod === 'Cartão').reduce((sum, s) => sum + s.total, 0),
      dinheiro: todaySales.filter(s => s.paymentMethod === 'Dinheiro').reduce((sum, s) => sum + s.total, 0),
      fichas: todayTransactions.filter(t => t.type === 'ficha' && t.subType === 'entrada').reduce((sum, t) => sum + (t.total || 0), 0),
      money: todayTransactions.filter(t => t.type === 'real' && t.subType === 'deposit').reduce((sum, t) => sum + t.amount, 0) - todayTransactions.filter(t => t.type === 'real' && t.subType === 'withdraw').reduce((sum, t) => sum + t.amount, 0)
    }

    // Get backend base
    const backendBase = userFetchedData?.[0] || { transactions: {}, fichas: 0, money: 0 }

    // Combined totals to sync
    const payload = {
      date: today,
      transactions: {
        pix: (backendBase.transactions?.pix || 0) + localTodayTotals.pix,
        cartao: (backendBase.transactions?.cartao || 0) + localTodayTotals.cartao,
        dinheiro: (backendBase.transactions?.dinheiro || 0) + localTodayTotals.dinheiro
      },
      fichas: (backendBase.fichas || 0) + localTodayTotals.fichas,
      money: (backendBase.money || 0) + localTodayTotals.money
    }

    try {
      setSyncStatus('syncing')
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': userApiKey
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setSyncStatus('success')
      } else {
        setSyncStatus('error')
      }
    } catch (error) {
      console.error('Error syncing to API:', error)
      setSyncStatus('error')
    }
  }

  const fetchAllAdminData = async () => {
    if (!adminPassword) return

    try {
      const response = await fetch(`${API_BASE_URL}/transactions?sinceBeginning=true`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': adminPassword
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAdminDataSinceBeginning(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching all admin data:', error)
    }
  }

  // Track if we've fetched historical data
  const [fetchedHistoricalData, setFetchedHistoricalData] = useState(false)

  // Refresh squares every 3 minutes, fetch historical data only once when tab enters
  useEffect(() => {
    if (!adminAuthenticated) return

    const today = getDateGMT3()

    // Fetch today's data immediately
    fetchAdminData(today)

    // Fetch historical data only once
    if (!fetchedHistoricalData) {
      fetchAllAdminData()
      setFetchedHistoricalData(true)
    }

    // Refresh only today's data every 3 minutes
    const refreshInterval = setInterval(() => {
      fetchAdminData(today)
    }, 3 * 60 * 1000) // 3 minutes

    return () => clearInterval(refreshInterval)
  }, [adminAuthenticated, adminPassword, fetchedHistoricalData])

  const setApiKey = (apiKey) => {
    // Auto-append the suffix
    const fullApiKey = `${apiKey}-quermesse-santa-clara`
    const expiryTime = Date.now() + 8 * 60 * 60 * 1000 // 8 hours
    localStorage.setItem('quermesse-api-key', fullApiKey)
    localStorage.setItem('quermesse-api-key-expiry', expiryTime.toString())
    setUserApiKey(fullApiKey)
    setUserApiKeyExpiry(expiryTime)
    setSetApiKeyDialogOpen(false)
    setApiKeyInput('')
    // Fetch user data from backend on login
    fetchUserData(fullApiKey)
  }

  const clearApiKey = () => {
    localStorage.removeItem('quermesse-api-key')
    localStorage.removeItem('quermesse-api-key-expiry')
    localStorage.removeItem('quermesse-user-fetched-data')
    setUserApiKey('')
    setUserApiKeyExpiry(null)
    setUserFetchedData(null)
    setAdminAuthenticated(false)
    setAdminData([])
    setAdminDataSinceBeginning([])
  }

  const getUserIdFromApiKey = (apiKey) => {
    const mapping = {
      'caixaA2026!-quermesse-santa-clara': 'CAIXA_A',
      'caixaB2026!-quermesse-santa-clara': 'CAIXA_B',
      'caixaC2026!-quermesse-santa-clara': 'CAIXA_C'
    }
    return mapping[apiKey] || null
  }

  const fetchUserData = async (apiKey) => {
    try {
      setLoadingUserData(true)
      const today = getDateGMT3()
      const response = await fetch(`${API_BASE_URL}/transactions?day=${today}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        }
      })

      if (response.ok) {
        const data = await response.json()
        const fetchedData = data.data || []
        setUserFetchedData(fetchedData)
        localStorage.setItem('quermesse-user-fetched-data', JSON.stringify(fetchedData))
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoadingUserData(false)
    }
  }

  const calculateTotalRealMoney = () => {
    const deposits = transactions
      .filter(t => t.type === 'real' && t.subType === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0)

    const withdrawals = transactions
      .filter(t => t.type === 'real' && t.subType === 'withdraw')
      .reduce((sum, t) => sum + t.amount, 0)

    return deposits - withdrawals
  }

  const getTotalByUser = (userId) => {
    const userData = adminData.find(d => d.userId === userId)
    if (!userData || !userData.transactions) return 0
    return (userData.transactions.pix || 0) +
           (userData.transactions.cartao || 0) +
           (userData.transactions.dinheiro || 0)
  }

  const getUserDetails = (userId) => {
    return adminData.find(d => d.userId === userId)
  }

  const getUniqueDates = () => {
    const today = getDateGMT3()
    const historicalDates = new Set(adminDataSinceBeginning.map(d => d.date))
    // Add today if we have data for it
    if (adminData.length > 0) {
      historicalDates.add(today)
    }
    return Array.from(historicalDates).sort((a, b) => new Date(b) - new Date(a))
  }

  const getDayTotal = (dayData, userId) => {
    const userData = dayData.find(d => d.userId === userId)
    if (!userData || !userData.transactions) return 0
    return (userData.transactions.pix || 0) +
           (userData.transactions.cartao || 0) +
           (userData.transactions.dinheiro || 0)
  }

  const getDayData = (date) => {
    const today = getDateGMT3()
    // For today, use adminData (updated every 3 min)
    // For historical days, use adminDataSinceBeginning (fetched once)
    if (date === today && adminData.length > 0) {
      return adminData
    }
    return adminDataSinceBeginning.filter(d => d.date === date)
  }

  const addFichaFromTransaction = () => {
    const newFichas = { ...fichas }
    let hasEntries = false
    const entries = []
    let total = 0
    const breakdown = {}

    DENOMINATIONS.forEach((denom) => {
      const quantity = parseInt(addFichaQuantities[denom]) || 0
      if (quantity > 0) {
        hasEntries = true
        newFichas[denom] = (newFichas[denom] || 0) + quantity
        entries.push(`${quantity}x R$ ${denom}`)
        total += denom * quantity
        breakdown[denom] = quantity
      }
    })

    if (hasEntries) {
      saveFichasToStorage(newFichas)

      const transaction = {
        id: Date.now(),
        timestamp: getTimestampGMT3(),
        type: 'ficha',
        subType: 'entrada',
        description: entries.join(', '),
        breakdown,
        total
      }
      const newTransactions = [...transactions, transaction]
      saveTransactionsToStorage(newTransactions)

      setAddFichaQuantities({ 1: '', 2: '', 5: '', 10: '', 20: '' })
      setAddFichaDialogOpen(false)
    }
  }

  const addRealMoneyTransaction = () => {
    const amount = parseFloat(addRealMoneyAmount) || 0
    if (amount > 0) {
      const transaction = {
        id: Date.now(),
        timestamp: getTimestampGMT3(),
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
      if (transaction.breakdown) {
        // New format with multiple denominations
        Object.entries(transaction.breakdown).forEach(([denom, quantity]) => {
          newFichas[denom] = Math.max(0, (newFichas[denom] || 0) - quantity)
        })
      } else {
        // Old format with single denomination
        newFichas[transaction.denomination] = Math.max(0, (newFichas[transaction.denomination] || 0) - transaction.quantity)
      }
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
    // Calculate fichas suggestion for total amount immediately
    const { result, totalChange, remaining } = calculateChange(total, changeMode, fichas)
    setSuggestedChange({ result, totalChange, remaining })
    setChangeDialogOpen(true)
  }

  const calculateChange = (amount, mode, availableFichas) => {
    let remaining = Math.round(amount * 100) // Work with cents

    // First, try to suggest using available fichas following the mode
    const availableResult = { 1: 0, 2: 0, 5: 0, 10: 0, 20: 0 }
    const fichasCopy = { ...availableFichas }
    let availableRemaining = remaining

    if (mode === 'privilegiar_troco') {
      const preferred = [2, 3, 5, 1, 10, 20]
      // First pass: use max 5 bills per denomination
      for (const denom of preferred) {
        const maxBills = 5
        const count = Math.min(availableRemaining / (denom * 100), fichasCopy[denom], maxBills)
        availableResult[denom] = Math.floor(count)
        availableRemaining -= availableResult[denom] * denom * 100
        fichasCopy[denom] -= availableResult[denom]
      }

      // Second pass: if remaining, continue without the 5-bill limit
      if (availableRemaining > 0) {
        for (const denom of preferred) {
          if (availableRemaining <= 0) break
          const count = Math.min(availableRemaining / (denom * 100), fichasCopy[denom])
          const additional = Math.floor(count)
          if (additional > 0) {
            availableResult[denom] += additional
            availableRemaining -= additional * denom * 100
            fichasCopy[denom] -= additional
          }
        }
      }
    } else {
      for (const denom of DENOMINATIONS) {
        const maxBills = 5
        // First pass: use max 5 bills per denomination
        const count = Math.min(availableRemaining / (denom * 100), fichasCopy[denom], maxBills)
        availableResult[denom] = Math.floor(count)
        availableRemaining -= availableResult[denom] * denom * 100
        fichasCopy[denom] -= availableResult[denom]
      }

      // Second pass: if remaining, continue without the 5-bill limit
      if (availableRemaining > 0) {
        for (const denom of DENOMINATIONS) {
          if (availableRemaining <= 0) break
          const count = Math.min(availableRemaining / (denom * 100), fichasCopy[denom])
          const additional = Math.floor(count)
          if (additional > 0) {
            availableResult[denom] += additional
            availableRemaining -= additional * denom * 100
            fichasCopy[denom] -= additional
          }
        }
      }
    }

    // Note: Limited to max 5 bills of each denomination in the above calculations

    // If exact change is possible with available fichas, use it
    if (availableRemaining === 0) {
      const totalChange = Object.entries(availableResult).reduce((sum, [denom, count]) => {
        return sum + (parseInt(denom) * count)
      }, 0)
      return { result: availableResult, totalChange, remaining: 0, shortage: 0 }
    }

    // Otherwise, suggest ideal breakdown (ignoring availability)
    const idealResult = { 1: 0, 2: 0, 5: 0, 10: 0, 20: 0 }

    if (mode === 'privilegiar_troco') {
      const preferred = [2, 3, 1, 5, 10, 20]
      // First pass: use max 5 bills per denomination
      for (const denom of preferred) {
        const maxBills = 5
        const count = Math.floor(remaining / (denom * 100))
        const limitedCount = Math.min(count, maxBills)
        idealResult[denom] = limitedCount
        remaining -= limitedCount * denom * 100
      }

      // Second pass: if remaining, continue without the 5-bill limit
      if (remaining > 0) {
        for (const denom of preferred) {
          const additional = Math.floor(remaining / (denom * 100))
          if (additional > 0) {
            idealResult[denom] += additional
            remaining -= additional * denom * 100
          }
        }
      }
    } else {
      // First pass: use max 5 bills per denomination
      for (const denom of DENOMINATIONS) {
        const maxBills = 5
        const count = Math.floor(remaining / (denom * 100))
        const limitedCount = Math.min(count, maxBills)
        idealResult[denom] = limitedCount
        remaining -= limitedCount * denom * 100
      }

      // Second pass: if remaining, continue without the 5-bill limit
      if (remaining > 0) {
        for (const denom of DENOMINATIONS) {
          const additional = Math.floor(remaining / (denom * 100))
          if (additional > 0) {
            idealResult[denom] += additional
            remaining -= additional * denom * 100
          }
        }
      }
    }

    const totalChange = Object.entries(idealResult).reduce((sum, [denom, count]) => {
      return sum + (parseInt(denom) * count)
    }, 0)
    return { result: idealResult, totalChange, remaining: 0, shortage: 0 }
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
    // Always calculate fichas for total amount
    const { result, totalChange, remaining } = calculateChange(total, changeMode, fichas)
    setSuggestedChange({ result, totalChange, remaining })
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
      timestamp: getTimestampGMT3(),
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
      timestamp: getTimestampGMT3(),
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
    // Clear all state and localStorage immediately
    setSales([])
    setTransactions([])
    setFichas({ 1: 0, 2: 0, 5: 0, 10: 0, 20: 0 })
    setCart([])
    setUserApiKey('')
    setUserApiKeyExpiry(null)
    setAdminAuthenticated(false)
    setAdminPassword('')
    setAdminData([])
    setAdminDataSinceBeginning([])
    setUserFetchedData(null)
    setLoadingUserData(false)
    setLoadingAdmin(false)
    setSyncStatus('idle')

    // Clear all localStorage keys
    localStorage.removeItem('quermesse-sales')
    localStorage.removeItem('quermesse-transactions')
    localStorage.removeItem('quermesse-fichas')
    localStorage.removeItem('quermesse-api-key')
    localStorage.removeItem('quermesse-api-key-expiry')
    localStorage.removeItem('quermesse-change-mode')

    // Stop any active API polling
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
      debounceTimeoutRef.current = null
    }

    // Set a flag to prevent data reload from localStorage
    localStorage.setItem('quermesse-clearing', 'true')
    setTimeout(() => {
      localStorage.removeItem('quermesse-clearing')
    }, 1000)

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

  // Create a combined list of local sales and backend data
  const combinedSales = []

  // Add local sales (newest first)
  const localSales = adminFilter === 'all'
    ? [...sales]
    : sales.filter(sale => sale.paymentMethod.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') === adminFilter)

  localSales.forEach(sale => {
    combinedSales.push({
      ...sale,
      type: 'local',
      timestamp: sale.timestamp
    })
  })

  const getBackendTotals = () => {
    if (!userFetchedData || userFetchedData.length === 0) return null
    const todayData = userFetchedData[0]
    return {
      pix: todayData.transactions?.pix || 0,
      cartao: todayData.transactions?.cartao || 0,
      dinheiro: todayData.transactions?.dinheiro || 0,
      fichas: todayData.fichas || 0,
      money: todayData.money || 0,
      date: todayData.date
    }
  }

  // Get today's date and backend totals (needed for combined list)
  const today = getDateGMT3()
  const backendTotals = getBackendTotals()

  // Add backend data row at the bottom only if values are non-zero
  if (backendTotals && (backendTotals.pix > 0 || backendTotals.cartao > 0 || backendTotals.dinheiro > 0)) {
    combinedSales.push({
      id: 'backend-today',
      type: 'backend',
      timestamp: `${today}T00:00:00Z`, // Midnight of today
      paymentMethod: 'Sincronizado',
      total: backendTotals.pix + backendTotals.cartao + backendTotals.dinheiro
    })
  }

  // Sort by timestamp (newest first)
  const sortedCombinedSales = combinedSales.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  const overallTotal = sales.reduce((sum, sale) => sum + sale.total, 0)

  const totalsByType = {
    pix: sales.filter(s => s.paymentMethod === 'Pix').reduce((sum, s) => sum + s.total, 0),
    cartao: sales.filter(s => s.paymentMethod === 'Cartão').reduce((sum, s) => sum + s.total, 0),
    dinheiro: sales.filter(s => s.paymentMethod === 'Dinheiro').reduce((sum, s) => sum + s.total, 0)
  }

  

  // Calculate combined totals (backend base + local today's data)
  const localTodaySales = sales.filter(s => s.timestamp.startsWith(today))
  const localTodayTransactions = transactions.filter(t => t.timestamp.startsWith(today))

  const combinedTotals = {
    pix: (backendTotals?.pix || 0) + localTodaySales.filter(s => s.paymentMethod === 'Pix').reduce((sum, s) => sum + s.total, 0),
    cartao: (backendTotals?.cartao || 0) + localTodaySales.filter(s => s.paymentMethod === 'Cartão').reduce((sum, s) => sum + s.total, 0),
    dinheiro: (backendTotals?.dinheiro || 0) + localTodaySales.filter(s => s.paymentMethod === 'Dinheiro').reduce((sum, s) => sum + s.total, 0),
    fichas: (backendTotals?.fichas || 0) + localTodayTransactions.filter(t => t.type === 'ficha' && t.subType === 'entrada').reduce((sum, t) => sum + (t.total || 0), 0),
    money: (backendTotals?.money || 0) + localTodayTransactions.filter(t => t.type === 'real' && t.subType === 'deposit').reduce((sum, t) => sum + t.amount, 0) - localTodayTransactions.filter(t => t.type === 'real' && t.subType === 'withdraw').reduce((sum, t) => sum + t.amount, 0)
  }

  const formatGMT3DateTime = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC' // Use UTC to avoid timezone conversion
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
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {userApiKey && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mr: 1 }}>
                  <Chip
                    label={userApiKey.slice(0, 15) + '...'}
                    size="small"
                    color="success"
                    icon={<CheckCircleIcon />}
                    onDelete={clearApiKey}
                  />
                  <Chip
                    label={syncStatus === 'syncing' ? 'Sincronizando...' : syncStatus === 'error' ? 'Erro' : 'Sincronizado'}
                    size="small"
                    color={syncStatus === 'syncing' ? 'warning' : syncStatus === 'error' ? 'error' : 'success'}
                  />
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  color="inherit"
                  onClick={syncToAPI}
                  startIcon={<RefreshIcon />}
                  sx={{ borderColor: 'rgba(255,255,255,0.3)', '&:hover': { borderColor: 'white' } }}
                >
                  Sincronizar
                </Button>
              </>
            )}
            <Button
              variant="outlined"
              size="small"
              color="inherit"
              onClick={() => setSetApiKeyDialogOpen(true)}
              startIcon={<LockIcon />}
              sx={{ borderColor: 'rgba(255,255,255,0.3)', '&:hover': { borderColor: 'white' } }}
            >
              {userApiKey ? 'Login' : 'Login'}
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="inherit"
              onClick={() => setConfirmClearDialogOpen(true)}
              startIcon={<RefreshIcon />}
              sx={{
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,0,0,0.1)'
                },
                fontWeight: 'bold'
              }}
            >
              Novo Dia
            </Button>
          </Box>
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
            <Tab
              value="admin"
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AdminIcon />
                  Admin
                </Box>
              }
            />
          </Tabs>
        </Paper>

        {currentTab === 'caixa' ? (
          <Grid container spacing={3}>
            {/* Product Grid */}
            <Grid item xs={12} md={8}>
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Chip
                            label={product.category}
                            size="small"
                            variant="outlined"
                          />
                          {product.shortcut && (
                            <Chip
                              label={`[${product.shortcut.toUpperCase()}]`}
                              size="small"
                              color="primary"
                              sx={{ ml: 1, fontWeight: 'bold' }}
                            />
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ mt: 3 }}>
                <FormControl component="fieldset">
                  <FormLabel component="legend" sx={{ fontSize: '0.75rem' }}>Modo das Fichas</FormLabel>
                  <RadioGroup
                    row
                    value={changeMode}
                    onChange={handleChangeModeChange}
                    sx={{ mt: 0.5, '& .MuiFormControlLabel-label': { fontSize: '0.75rem' } }}
                  >
                    <FormControlLabel
                      value="normal"
                      control={<Radio size="small" />}
                      label="Normal"
                    />
                    <FormControlLabel
                      value="privilegiar_troco"
                      control={<Radio size="small" />}
                      label="Privilegiar Troco"
                    />
                  </RadioGroup>
                </FormControl>
              </Box>
            </Grid>

            {/* Cart Panel */}
            <Grid item xs={12} md={4}>
              <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
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
                  p: 2,
                  bgcolor: '#ffebee',
                  color: '#b71c1c',
                  borderRadius: 2,
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  border: '2px solid #d32f2f',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  animation: 'pulse 2s infinite'
                }}>
                  <WarningIcon sx={{ fontSize: '1.5rem', color: '#d32f2f' }} />
                  <span>FICHAS ACABANDO: {lowFichasWarnings.map(d => `R$ ${d} (${fichas[d]})`).join(', ')}</span>
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
                      <Typography variant="h5">R$ {(combinedTotals.pix + combinedTotals.cartao + combinedTotals.dinheiro).toFixed(2)}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, bgcolor: '#A1887F', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', minHeight: 100 }}>
                      <Typography variant="body2">Total Pix</Typography>
                      <Typography variant="h5">R$ {combinedTotals.pix.toFixed(2)}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, bgcolor: '#BCAAA4', color: '#3E2723', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', minHeight: 100 }}>
                      <Typography variant="body2">Total Cartão</Typography>
                      <Typography variant="h5">R$ {combinedTotals.cartao.toFixed(2)}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, bgcolor: '#D7CCC8', color: '#3E2723', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', minHeight: 100 }}>
                      <Typography variant="body2">Total Dinheiro</Typography>
                      <Typography variant="h5">R$ {combinedTotals.dinheiro.toFixed(2)}</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {sales.length === 0 && !backendTotals ? (
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
                          {sortedCombinedSales.map((sale) => {
                            if (sale.type === 'backend') {
                              // Backend data row
                              return (
                                <TableRow key={sale.id} sx={{ bgcolor: '#E8DFD0' }}>
                                  <TableCell>
                                    {today} 00:00
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="caption" sx={{ color: '#5D4037' }}>
                                      Dados sincronizados
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                                    R$ {sale.total.toFixed(2)}
                                  </TableCell>
                                  <TableCell align="right" />
                                </TableRow>
                              )
                            } else {
                              // Local sales row
                              return (
                                <TableRow key={sale.id} hover>
                                  <TableCell>{formatGMT3DateTime(sale.timestamp)}</TableCell>
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
                              )
                            }
                          })}
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
                        setAddFichaQuantities({ 1: '', 2: '', 5: '', 10: '', 20: '' })
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
                        R$ {combinedTotals.fichas.toFixed(2)}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4} md={4}>
                    <Paper sx={{ p: 2, bgcolor: '#5D4037', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', minHeight: 100 }}>
                      <Typography variant="body2">Saldo Dinheiro Real</Typography>
                      <Typography variant="h5">
                        R$ {combinedTotals.money.toFixed(2)}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4} md={4}>
                    <Paper sx={{ p: 2, bgcolor: '#3E2723', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', minHeight: 100 }}>
                      <Typography variant="body2">Total Vendido</Typography>
                      <Typography variant="h5">
                        R$ {(combinedTotals.pix + combinedTotals.cartao + combinedTotals.dinheiro).toFixed(2)}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {transactions.length === 0 && !backendTotals ? (
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
                          {/* Create combined transactions list */}
                          {(() => {
                            const combinedTransactions = []

                            // Add local transactions (newest first)
                            transactions.forEach(transaction => {
                              combinedTransactions.push({
                                ...transaction,
                                source: 'local' // Use 'source' instead of overwriting 'type'
                              })
                            })

                            // Add backend data rows at the bottom only if values are non-zero
                            if (backendTotals) {
                              // Add fichas backend row only if fichas > 0
                              if (backendTotals.fichas > 0) {
                                combinedTransactions.push({
                                  id: 'backend-fichas',
                                  source: 'backend',
                                  type: 'ficha',
                                  timestamp: `${today}T00:00:00Z`,
                                  displayType: 'Ficha',
                                  description: 'Total de Fichas (sincronizado)',
                                  amount: backendTotals.fichas,
                                  displayAmount: `R$ ${backendTotals.fichas.toFixed(2)}`
                                })
                              }

                              // Add money backend row only if money != 0
                              if (backendTotals.money !== 0) {
                                combinedTransactions.push({
                                  id: 'backend-money',
                                  source: 'backend',
                                  type: 'money',
                                  timestamp: `${today}T00:00:00Z`,
                                  displayType: 'Saldo',
                                  description: 'Saldo Dinheiro Real (sincronizado)',
                                  amount: backendTotals.money,
                                  displayAmount: `R$ ${backendTotals.money.toFixed(2)}`
                                })
                              }
                            }

                            // Sort by timestamp (newest first)
                            return combinedTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                          })().map((transaction) => {
                            if (transaction.source === 'backend') {
                              // Backend data row
                              return (
                                <TableRow key={transaction.id} sx={{ bgcolor: '#E8DFD0' }}>
                                  <TableCell>
                                    {today} 00:00
                                  </TableCell>
                                  <TableCell>
                                    <Chip label={transaction.displayType} color={transaction.displayType === 'Ficha' ? 'info' : 'success'} size="small" />
                                  </TableCell>
                                  <TableCell>
                                    {transaction.description}
                                  </TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                                    {transaction.displayAmount}
                                  </TableCell>
                                  <TableCell align="right" />
                                </TableRow>
                              )
                            } else {
                              // Local transactions row
                              return (
                                <TableRow key={transaction.id} hover>
                                  <TableCell>{formatGMT3DateTime(transaction.timestamp)}</TableCell>
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
                                      transaction.description || `${transaction.quantity}x Ficha R$ ${transaction.denomination}`
                                    ) : transaction.subType === 'deposit' ? (
                                      'Entrada de dinheiro real'
                                    ) : (
                                      'Saída de dinheiro real'
                                    )}
                                  </TableCell>
                                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                                    {transaction.source === 'backend' ? (
                                      transaction.displayAmount || '-'
                                    ) : transaction.type === 'ficha' ? (
                                      transaction.total ? `R$ ${transaction.total.toFixed(2)}` : '-'
                                    ) : transaction.subType === 'deposit' ? (
                                      transaction.amount ? `R$ ${transaction.amount.toFixed(2)}` : '-'
                                    ) : (
                                      transaction.amount ? `R$ ${transaction.amount.toFixed(2)}` : '-'
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
                              )
                            }
                          })}
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
                  <FormLabel component="legend">Modo das Fichas</FormLabel>
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
                  <Typography variant="h4">R$ {combinedTotals.fichas.toFixed(2)}</Typography>
                </Paper>

                <Paper sx={{ p: 3, bgcolor: '#5D4037', color: 'white', mb: 3 }}>
                  <Typography variant="body2">Total em Dinheiro Real:</Typography>
                  <Typography variant="h4">R$ {combinedTotals.money.toFixed(2)}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                    (Entradas - Saídas)
                  </Typography>
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
        ) : currentTab === 'admin' ? (
          /* Admin Panel */
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AdminIcon />
                  Painel Administrativo
                </Typography>

                {!adminAuthenticated ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <LockIcon sx={{ fontSize: 64, mb: 2, color: 'text.secondary' }} />
                    <Typography variant="h6" gutterBottom>Área Restrita</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Digite a senha de administrador para acessar
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<LockIcon />}
                      onClick={() => setAdminPasswordDialogOpen(true)}
                      sx={{ mt: 2 }}
                    >
                      Entrar com Senha
                    </Button>
                  </Box>
                ) : (
                  <>
                    {loadingAdmin ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                      </Box>
                    ) : (
                      <>
                        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Dados de {getDateGMT3().split('-').reverse().join('/')}
                            </Typography>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                // Clear existing data and refetch everything
                                fetchAdminData(getDateGMT3())
                                fetchAllAdminData()
                              }}
                              startIcon={<RefreshIcon />}
                              color="primary"
                            >
                            </Button>
                          </Box>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setAdminAuthenticated(false)}
                            color="error"
                          >
                            Sair
                          </Button>
                        </Box>

                        {/* Grand Total */}
                        {adminData.length > 0 && (
                          <Box sx={{ mb: 4, textAlign: 'center' }}>
                            <Paper sx={{
                              p: 3,
                              bgcolor: '#3E2723',
                              color: 'white',
                              display: 'inline-block',
                              minWidth: 320,
                              boxShadow: 4
                            }}>
                              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                Total Geral das Vendas
                              </Typography>
                              <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                                R$ {adminData.reduce((sum, d) => {
                                  const t = d.transactions || {}
                                  return sum + (t.pix || 0) + (t.cartao || 0) + (t.dinheiro || 0)
                                }, 0).toFixed(2)}
                              </Typography>
                            </Paper>
                          </Box>
                        )}

                        {/* User Cards */}
                        <Grid container spacing={3} justifyContent="center">
                          {['CAIXA_A', 'CAIXA_B', 'CAIXA_C'].map(userId => {
                            const total = getTotalByUser(userId)
                            const userData = getUserDetails(userId)
                            return (
                              <Grid item xs={12} sm={4} md={3} key={userId}>
                                <Card
                                  sx={{
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    '&:hover': {
                                      transform: 'translateY(-4px)',
                                      boxShadow: 6
                                    },
                                    background: 'linear-gradient(135deg, #8D6E63 0%, #6D4C41 100%)',
                                    color: 'white',
                                    border: userData && userData.fichas && userData.transactions ?
                                      `4px solid ${Math.max(0, (userData.fichas || 0) - ((userData.transactions?.dinheiro || 0) + (userData.transactions?.cartao || 0) + (userData.transactions?.pix || 0))) < 100 ? '#ff0000' : 'transparent'}` : 'transparent',
                                    boxShadow: userData && userData.fichas && userData.transactions ?
                                      Math.max(0, (userData.fichas || 0) - ((userData.transactions?.dinheiro || 0) + (userData.transactions?.cartao || 0) + (userData.transactions?.pix || 0))) < 100 ? '0 0 20px rgba(255, 0, 0, 0.5)' : 'none' : 'none',
                                    '&:focus': {
                                      outline: userData && userData.fichas && userData.transactions ?
                                        `4px solid ${Math.max(0, (userData.fichas || 0) - ((userData.transactions?.dinheiro || 0) + (userData.transactions?.cartao || 0) + (userData.transactions?.pix || 0))) < 100 ? '#ff0000' : 'transparent'}` : 'transparent'
                                    }
                                  }}
                                  onClick={() => {
                                    const userSalesByDay = adminDataSinceBeginning
                                      .filter(d => d.userId === userId)
                                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                                    setSelectedDaySales(userSalesByDay)
                                    setDaySalesDialogOpen(true)
                                  }}
                                >
                                  <CardContent sx={{ textAlign: 'center' }}>
                                    <Typography variant="h4" gutterBottom>
                                      {userId.replace('_', ' ')}
                                    </Typography>
                                    <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.3)' }} />
                                    <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                                      Total de Vendas
                                    </Typography>
                                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                                      R$ {total.toFixed(2)}
                                    </Typography>
                                    {userData && userData.transactions && (
                                      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.5, opacity: 0.9 }}>
                                        <Typography variant="caption">
                                          Pix: R$ {(userData.transactions.pix || 0).toFixed(2)}
                                        </Typography>
                                        <Typography variant="caption">
                                          Cartão: R$ {(userData.transactions.cartao || 0).toFixed(2)}
                                        </Typography>
                                        <Typography variant="caption">
                                          Dinheiro: R$ {(userData.transactions.dinheiro || 0).toFixed(2)}
                                        </Typography>
                                      </Box>
                                    )}
                                    {userData && userData.fichas && (
                                      <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.5, opacity: 0.9 }}>
                                        <Typography variant="caption">
                                          Fichas Total: R$ {(userData.fichas || 0).toFixed(2)}
                                        </Typography>
                                        <Typography variant="caption">
                                          Fichas Ainda No Caixa: R$ {Math.max(0, (userData.fichas || 0) - ((userData.transactions?.dinheiro || 0) + (userData.transactions?.cartao || 0) + (userData.transactions?.pix || 0))).toFixed(2)}
                                        </Typography>
                                      </Box>
                                    )}
                                  </CardContent>
                                </Card>
                              </Grid>
                            )
                          })}
                        </Grid>

                        {/* Daily Sales List */}
                        <Box sx={{ mt: 4 }}>
                          <Typography variant="h6" gutterBottom>Vendas por Dia</Typography>
                          {getUniqueDates().length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                              Nenhum dado disponível
                            </Typography>
                          ) : (
                            <TableContainer component={Paper}>
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Data</TableCell>
                                    <TableCell align="right">CAIXA A</TableCell>
                                    <TableCell align="right">CAIXA B</TableCell>
                                    <TableCell align="right">CAIXA C</TableCell>
                                    <TableCell align="right">Total</TableCell>
                                    {/* <TableCell align="right">Fichas</TableCell> */}
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {getUniqueDates().map(date => {
                                    const dayData = getDayData(date)
                                    const totalA = getDayTotal(dayData, 'CAIXA_A')
                                    const totalB = getDayTotal(dayData, 'CAIXA_B')
                                    const totalC = getDayTotal(dayData, 'CAIXA_C')
                                    const grandTotal = totalA + totalB + totalC
                                    return (
                                      <TableRow
                                        key={date}
                                        hover
                                        sx={{ cursor: 'pointer' }}
                                        onClick={() => {
                                          setSelectedDaySales(dayData)
                                          setDaySalesDialogOpen(true)
                                        }}
                                      >
                                        <TableCell>
                                          {date.split('-').reverse().join('/')}
                                        </TableCell>
                                        <TableCell align="right">
                                          {totalA > 0 ? `R$ ${totalA.toFixed(2)}` : '-'}
                                        </TableCell>
                                        <TableCell align="right">
                                          {totalB > 0 ? `R$ ${totalB.toFixed(2)}` : '-'}
                                        </TableCell>
                                        <TableCell align="right">
                                          {totalC > 0 ? `R$ ${totalC.toFixed(2)}` : '-'}
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                          R$ {grandTotal.toFixed(2)}
                                        </TableCell>
                                        {/* <TableCell align="right">
                                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                            <Typography variant="body2">
                                              CAIXA A: R$ {adminDataSinceBeginning.filter(d => d.date === date && d.userId === 'CAIXA_A')[0]?.fichas || 0}
                                            </Typography>
                                            <Typography variant="body2">
                                              CAIXA B: R$ {adminDataSinceBeginning.filter(d => d.date === date && d.userId === 'CAIXA_B')[0]?.fichas || 0}
                                            </Typography>
                                            <Typography variant="body2">
                                              CAIXA C: R$ {adminDataSinceBeginning.filter(d => d.date === date && d.userId === 'CAIXA_C')[0]?.fichas || 0}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                              No Caixa: R$ {Math.max(0, (adminDataSinceBeginning.filter(d => d.date === date).reduce((sum, d) => sum + (d.fichas || 0), 0) - grandTotal)).toFixed(2)}
                                            </Typography>
                                          </Box>
                                        </TableCell> */}
                                      </TableRow>
                                    )
                                  })}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          )}
                        </Box>
                      </>
                    )}
                  </>
                )}
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

          <Divider sx={{ my: 2 }} />

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
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

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

          {amountReceived && parseFloat(amountReceived) >= total && (
            <Typography variant="h6" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
              <CheckCircleIcon />
              Troco: R$ {(parseFloat(amountReceived) - total).toFixed(2)}
            </Typography>
          )}

          {amountReceived && parseFloat(amountReceived) < total && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              Valor insuficiente. Faltam R$ {(total - parseFloat(amountReceived)).toFixed(2)}
            </Typography>
          )}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
            <RefreshIcon />
            Novo Dia - Limpar Tudo
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja iniciar um novo dia? Isso limpará absolutamente tudo:
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              • Todas as vendas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Todas as transações de entrada/saída
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Todas as fichas e dinheiro real
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Dados sincronizados com servidor
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • API keys e sessões
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Dados carregados do backend
            </Typography>
          </Box>
          {(sales.length > 0 || transactions.length > 0) && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                Dados que serão excluídos:
              </Typography>
              {sales.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  • {sales.length} venda(s)
                </Typography>
              )}
              {transactions.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  • {transactions.length} transação(ões)
                </Typography>
              )}
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
            // Clear API keys
            localStorage.removeItem('quermesse-api-key')
            localStorage.removeItem('quermesse-api-key-expiry')
            setUserApiKey('')
            setUserApiKeyExpiry(null)
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
                <strong>Data:</strong> {formatGMT3DateTime(saleToDelete.timestamp)}
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
                Data: {formatGMT3DateTime(saleToEdit.timestamp)}
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
          <Box sx={{ mt: 3 }}>
            {DENOMINATIONS.map((denom) => (
              <Box key={denom} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1" sx={{ minWidth: 80 }}>
                  R$ {denom}
                </Typography>
                <TextField
                  type="number"
                  label="Quantidade"
                  value={addFichaQuantities[denom]}
                  onChange={(e) => setAddFichaQuantities({ ...addFichaQuantities, [denom]: e.target.value })}
                  inputProps={{ min: 0, step: 1 }}
                  size="small"
                  sx={{ width: 120 }}
                />
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAddFichaDialogOpen(false)
            setAddFichaQuantities({ 1: '', 2: '', 5: '', 10: '', 20: '' })
          }}>Cancelar</Button>
          <Button
            onClick={addFichaFromTransaction}
            variant="contained"
            disabled={!DENOMINATIONS.some(d => addFichaQuantities[d] && parseInt(addFichaQuantities[d]) > 0)}
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

      {/* Set API Key Dialog */}
      <Dialog open={setApiKeyDialogOpen} onClose={() => {
        setSetApiKeyDialogOpen(false)
        setApiKeyInput('')
        setShowApiKey(false)
      }} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LockIcon color="primary" />
            Login
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Insira sua API Key para sincronizar dados com o servidor.
            A chave expirará automaticamente após 8 horas.
          </Typography>
          <TextField
            fullWidth
            label="API Key"
            type={showApiKey ? 'text' : 'password'}
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            autoFocus
            sx={{ mt: 2 }}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowApiKey(!showApiKey)}
                  edge="end"
                  tabIndex={-1}
                >
                  <VisibilityIcon />
                </IconButton>
              )
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setSetApiKeyDialogOpen(false)
            setApiKeyInput('')
          }}>Cancelar</Button>
          <Button
            onClick={() => setApiKey(apiKeyInput)}
            variant="contained"
            disabled={!apiKeyInput}
            color="success"
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Admin Password Dialog */}
      <Dialog open={adminPasswordDialogOpen} onClose={() => {
        setAdminPasswordDialogOpen(false)
        setAdminPassword('')
        setShowAdminPassword(false)
      }} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LockIcon color="primary" />
            Área Restrita
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Digite a senha de administrador para acessar o painel.
          </Typography>
          <TextField
            fullWidth
            label="Senha"
            type={showApiKey ? 'text' : 'password'}
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            autoFocus
            sx={{ mt: 2 }}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowApiKey(!showApiKey)}
                  edge="end"
                  tabIndex={-1}
                >
                  <VisibilityIcon />
                </IconButton>
              )
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAdminPasswordDialogOpen(false)
            setAdminPassword('')
          }}>Cancelar</Button>
          <Button
            onClick={() => {
              // Auto-append the suffix for admin password
              setAdminPassword(`${adminPassword}-quermesse-santa-clara`)
              setAdminAuthenticated(true)
              setAdminPasswordDialogOpen(false)
            }}
            variant="contained"
            disabled={!adminPassword}
            color="primary"
          >
            Entrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Day Sales Dialog */}
      <Dialog
        open={daySalesDialogOpen}
        onClose={() => {
          setDaySalesDialogOpen(false)
          setSelectedDaySales(null)
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VisibilityIcon color="primary" />
            Vendas por Dia
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedDaySales && selectedDaySales.length > 0 ? (
            <>
              {selectedDaySales.length === 1 ? (
                /* Single day, single user - show breakdown by type */
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Caixa: {selectedDaySales[0].userId.replace('_', ' ')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Data: {selectedDaySales[0].date.split('-').reverse().join('/')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Última atualização: {formatGMT3DateTime(selectedDaySales[0].updatedAt)}
                      </Typography>
                      {selectedDaySales[0].fichas && (
                        <Typography variant="body2" color="text.secondary">
                          Fichas Total: R$ {(selectedDaySales[0].fichas || 0).toFixed(2)}
                        </Typography>
                      )}
                      {selectedDaySales[0].fichas && (
                        <Typography variant="body2" color="text.secondary">
                          Fichas Ainda No Caixa: R$ {Math.max(0, (selectedDaySales[0].fichas || 0) - ((selectedDaySales[0].transactions?.dinheiro || 0) + (selectedDaySales[0].transactions?.cartao || 0) + (selectedDaySales[0].transactions?.pix || 0))).toFixed(2)}
                        </Typography>
                      )}
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>Vendas por Tipo</Typography>
                    <Grid container spacing={2}>
                      {[
                        { key: 'pix', label: 'Pix', color: '#4CAF50' },
                        { key: 'cartao', label: 'Cartão', color: '#2196F3' },
                        { key: 'dinheiro', label: 'Dinheiro', color: '#FF9800' }
                      ].map(({ key, label, color }) => (
                        <Grid item xs={4} key={key}>
                          <Paper sx={{ p: 2, bgcolor: color, color: 'white', textAlign: 'center' }}>
                            <Typography variant="body2">{label}</Typography>
                            <Typography variant="h5">
                              R$ {(selectedDaySales[0].transactions?.[key] || 0).toFixed(2)}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>

                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, bgcolor: '#8D6E63', color: 'white', textAlign: 'center', mt: 2 }}>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Total do Dia
                      </Typography>
                      <Typography variant="h4">
                        R$ {((selectedDaySales[0].transactions?.pix || 0) +
                               (selectedDaySales[0].transactions?.cartao || 0) +
                               (selectedDaySales[0].transactions?.dinheiro || 0)).toFixed(2)}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              ) : (
                /* Multiple users for the same day - show all breakdowns */
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Data: {selectedDaySales[0].date.split('-').reverse().join('/')}
                      </Typography>
                    </Paper>
                  </Grid>

                  {selectedDaySales.map(userData => (
                    <Grid item xs={12} key={`${userData.userId}-${userData.date}`}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          {userData.userId.replace('_', ' ')}
                        </Typography>
                        <Grid container spacing={2}>
                          {[
                            { key: 'pix', label: 'Pix', color: '#4CAF50' },
                            { key: 'cartao', label: 'Cartão', color: '#2196F3' },
                            { key: 'dinheiro', label: 'Dinheiro', color: '#FF9800' }
                          ].map(({ key, label, color }) => (
                            <Grid item xs={4} key={key}>
                              <Box sx={{ textAlign: 'center', p: 1, bgcolor: color, borderRadius: 1, color: 'white' }}>
                                <Typography variant="caption">{label}</Typography>
                                <Typography variant="h6">
                                  R$ {(userData.transactions?.[key] || 0).toFixed(2)}
                                </Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="body2" align="right">
                          Total: R$ {((userData.transactions?.pix || 0) +
                                     (userData.transactions?.cartao || 0) +
                                     (userData.transactions?.dinheiro || 0)).toFixed(2)}
                        </Typography>
                        {userData.fichas && (
                          <Typography variant="body2" align="right" sx={{ mt: 1 }}>
                            Fichas Total: R$ {(userData.fichas || 0).toFixed(2)}
                          </Typography>
                        )}
                        {userData.fichas && (
                          <Typography variant="body2" align="right" sx={{ mt: 1, color: 'text.secondary' }}>
                            Fichas Ainda No Caixa: R$ {Math.max(0, (userData.fichas || 0) - ((userData.transactions?.dinheiro || 0) + (userData.transactions?.cartao || 0) + (userData.transactions?.pix || 0))).toFixed(2)}
                          </Typography>
                        )}
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          ) : (
            <Typography>Nenhum dado disponível</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDaySalesDialogOpen(false)
            setSelectedDaySales(null)
          }}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default App
