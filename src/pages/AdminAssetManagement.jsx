import React, { useState, useEffect, useContext } from 'react';
import axios from '../utils/api';
import AuthContext from '../context/AuthContext';
import {
    Plus, Package, Share2, Inbox, History,
    Trash2, Edit2, CheckCircle, AlertCircle,
    User, Calendar, DollarSign, Tag, Info,
    ArrowRightLeft, Download, Loader2, Search, X,
    Wrench, ShieldAlert, Cpu, HardDrive, MousePointer,
    Keyboard, Headphones, Zap, MapPin, Building,
    Filter, AlertTriangle, Clock, RefreshCw, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminAssetManagement = () => {
    const { user } = useContext(AuthContext);
    // Tab Navigation: overview, fixedAssets, accessories, repairs, allocations
    const [activeTab, setActiveTab] = useState('overview');
    
    // States
    const [stats, setStats] = useState(null);
    const [assets, setAssets] = useState([]);
    const [products, setProducts] = useState([]);
    const [repairs, setRepairs] = useState([]);
    const [distributions, setDistributions] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');

    // Edit States
    const [editingAsset, setEditingAsset] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);

    // Form States - Fixed Hardware Asset
    const [assetForm, setAssetForm] = useState({
        assetId: '',
        itemName: '',
        category: 'Laptop',
        serialNumber: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        vendor: '',
        cost: '',
        warrantyExpiry: '',
        amcExpiry: '',
        licenseExpiry: '',
        condition: 'New',
        status: 'Available',
        location: 'Chandigarh Office',
        department: 'Accounts',
        assignedTo: '',
        description: ''
    });

    // Form States - Consumable Accessories & Stock
    const [productForm, setProductForm] = useState({
        modelName: '',
        category: 'Mouse',
        totalQuantity: '',
        lowStockThreshold: 5,
        price: '',
        condition: 'New',
        location: 'Store Room',
        pendingPurchase: false,
        purchaseDate: new Date().toISOString().split('T')[0]
    });

    // Form States - Repair Log
    const [repairForm, setRepairForm] = useState({
        assetId: '',
        problemDescription: '',
        vendor: 'IT Repair Center',
        estimatedCost: '',
        startDate: new Date().toISOString().split('T')[0]
    });

    // Form States - Distribute Consumables
    const [distForm, setDistForm] = useState({
        productId: '',
        employeeId: '',
        quantityAssigned: 1,
        distributionDate: new Date().toISOString().split('T')[0],
        remarks: ''
    });

    useEffect(() => {
        fetchAllData();
        fetchEmployees();
    }, [activeTab]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [statsRes, assetsRes, productsRes, repairsRes, distRes] = await Promise.all([
                axios.get('/assets/stats').catch(() => axios.get('/assets/dashboard-stats')).catch(() => ({ data: null })),
                axios.get('/assets/items').catch(() => axios.get('/assets')).catch(() => ({ data: [] })),
                axios.get('/assets/products').catch(() => axios.get('/assets')).catch(() => ({ data: [] })),
                axios.get('/assets/repairs').catch(() => ({ data: [] })),
                axios.get('/assets/distributions').catch(() => ({ data: [] }))
            ]);

            const assetList = Array.isArray(assetsRes.data) ? assetsRes.data : [];
            const productList = Array.isArray(productsRes.data) ? productsRes.data : [];
            const distList = Array.isArray(distRes.data) ? distRes.data : [];
            const repairList = Array.isArray(repairsRes.data) ? repairsRes.data : [];

            setAssets(assetList);
            setProducts(productList);
            setRepairs(repairList);
            setDistributions(distList);

            if (statsRes && statsRes.data) {
                setStats(statsRes.data);
            } else {
                // Client-side fallback calculation if live server backend has not been redeployed yet
                let totalVal = 0;
                productList.forEach(p => totalVal += ((p.availableQuantity || 0) * (p.price || 0)));
                assetList.forEach(a => totalVal += (a.cost || 0));

                setStats({
                    assetOverview: {
                        total: assetList.length + productList.length,
                        inUse: distList.length,
                        available: productList.reduce((acc, p) => acc + (p.availableQuantity || 0), 0),
                        underRepair: repairList.filter(r => r.status === 'In Repair').length,
                        retired: 0,
                        scrap: 0,
                        lostDamaged: 0,
                        totalValuation: totalVal
                    },
                    inventorySummary: {
                        totalStockItems: productList.length,
                        totalQuantity: productList.reduce((acc, p) => acc + (p.totalQuantity || 0), 0),
                        availableQuantity: productList.reduce((acc, p) => acc + (p.availableQuantity || 0), 0),
                        lowStockCount: productList.filter(p => (p.availableQuantity || 0) <= (p.lowStockThreshold || 5)).length,
                        outOfStockCount: productList.filter(p => (p.availableQuantity || 0) === 0).length,
                        totalStockValue: totalVal,
                        pendingPurchases: productList.filter(p => p.pendingPurchase).length
                    },
                    accessoriesBreakdown: {
                        Mouse: productList.filter(p => p.category === 'Mouse').reduce((acc, p) => acc + (p.availableQuantity || 0), 0),
                        Keyboard: productList.filter(p => p.category === 'Keyboard').reduce((acc, p) => acc + (p.availableQuantity || 0), 0),
                        Headset: productList.filter(p => p.category === 'Headset').reduce((acc, p) => acc + (p.availableQuantity || 0), 0),
                        Charger: productList.filter(p => p.category === 'Charger').reduce((acc, p) => acc + (p.availableQuantity || 0), 0),
                        Cable: productList.filter(p => p.category === 'Cable').reduce((acc, p) => acc + (p.availableQuantity || 0), 0),
                        Adapter: productList.filter(p => p.category === 'Adapter').reduce((acc, p) => acc + (p.availableQuantity || 0), 0),
                        RAM: productList.filter(p => p.category === 'RAM').reduce((acc, p) => acc + (p.availableQuantity || 0), 0),
                        SSD: productList.filter(p => p.category === 'SSD').reduce((acc, p) => acc + (p.availableQuantity || 0), 0),
                        Other: productList.filter(p => !['Mouse','Keyboard','Headset','Charger','Cable','Adapter','RAM','SSD'].includes(p.category)).reduce((acc, p) => acc + (p.availableQuantity || 0), 0)
                    },
                    alerts: {
                        warrantyExpiringSoon: [],
                        amcExpiringSoon: [],
                        licenseExpiringSoon: [],
                        lowStockItems: productList.filter(p => (p.availableQuantity || 0) <= (p.lowStockThreshold || 5)).map(p => ({ id: p._id, name: p.modelName, category: p.category || 'Stock', available: p.availableQuantity || 0, threshold: p.lowStockThreshold || 5 })),
                        repairPendingItems: repairList.filter(r => r.status === 'In Repair').map(r => ({ id: r._id, itemName: r.itemName, tag: r.assetIdTag, problem: r.problemDescription, vendor: r.vendor })),
                        assetNotReturned: []
                    }
                });
            }
        } catch (error) {
            toast.error("Failed to load inventory data");
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await axios.get('/employees');
            setEmployees(res.data || []);
        } catch (error) {
            console.error("Failed to fetch employees");
        }
    };

    // ================= Fixed Assets Actions =================
    const handleSaveAsset = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            if (editingAsset) {
                await axios.put(`/assets/items/${editingAsset._id}`, assetForm).catch(() =>
                    axios.put(`/assets/${editingAsset._id}`, assetForm)
                );
                toast.success("Fixed Asset updated successfully");
                setEditingAsset(null);
            } else {
                await axios.post('/assets/items', assetForm).catch(() =>
                    axios.post('/assets', assetForm)
                );
                toast.success("Fixed Asset added successfully");
            }
            setAssetForm({
                assetId: '',
                itemName: '',
                category: 'Laptop',
                serialNumber: '',
                purchaseDate: new Date().toISOString().split('T')[0],
                vendor: '',
                cost: '',
                warrantyExpiry: '',
                amcExpiry: '',
                licenseExpiry: '',
                condition: 'New',
                status: 'Available',
                location: 'Chandigarh Office',
                department: 'Accounts',
                assignedTo: '',
                description: ''
            });
            fetchAllData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save asset");
        } finally {
            setSubmitting(false);
        }
    };

    const startEditAsset = (a) => {
        setEditingAsset(a);
        setAssetForm({
            assetId: a.assetId || '',
            itemName: a.itemName || '',
            category: a.category || 'Laptop',
            serialNumber: a.serialNumber || '',
            purchaseDate: a.purchaseDate ? new Date(a.purchaseDate).toISOString().split('T')[0] : '',
            vendor: a.vendor || '',
            cost: a.cost !== undefined ? a.cost : '',
            warrantyExpiry: a.warrantyExpiry ? new Date(a.warrantyExpiry).toISOString().split('T')[0] : '',
            amcExpiry: a.amcExpiry ? new Date(a.amcExpiry).toISOString().split('T')[0] : '',
            licenseExpiry: a.licenseExpiry ? new Date(a.licenseExpiry).toISOString().split('T')[0] : '',
            condition: a.condition || 'New',
            status: a.status || 'Available',
            location: a.location || 'Chandigarh Office',
            department: a.department || 'Accounts',
            assignedTo: a.assignedTo?._id || a.assignedTo || '',
            description: a.description || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteAsset = async (id) => {
        if (!window.confirm("Are you sure you want to delete this hardware asset record?")) return;
        try {
            await axios.delete(`/assets/items/${id}`).catch(() =>
                axios.delete(`/assets/${id}`)
            );
            toast.success("Asset deleted successfully");
            fetchAllData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete asset");
        }
    };

    // ================= Accessories Stock Actions =================
    const handleSaveProduct = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const payload = {
                modelName: productForm.modelName,
                category: productForm.category,
                totalQuantity: Number(productForm.totalQuantity),
                lowStockThreshold: Number(productForm.lowStockThreshold || 5),
                price: Number(productForm.price),
                condition: productForm.condition,
                location: productForm.location,
                pendingPurchase: Boolean(productForm.pendingPurchase),
                purchaseDate: productForm.purchaseDate
            };
            if (editingProduct) {
                await axios.put(`/assets/products/${editingProduct._id}`, payload).catch(() =>
                    axios.put(`/assets/${editingProduct._id}`, payload)
                );
                toast.success("Accessory stock updated");
                setEditingProduct(null);
            } else {
                await axios.post('/assets/products', payload).catch(() =>
                    axios.post('/assets', payload)
                );
                toast.success("Accessory stock added");
            }
            setProductForm({
                modelName: '',
                category: 'Mouse',
                totalQuantity: '',
                lowStockThreshold: 5,
                price: '',
                condition: 'New',
                location: 'Store Room',
                pendingPurchase: false,
                purchaseDate: new Date().toISOString().split('T')[0]
            });
            fetchAllData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save accessory stock");
        } finally {
            setSubmitting(false);
        }
    };

    const startEditProduct = (p) => {
        setEditingProduct(p);
        setProductForm({
            modelName: p.modelName || '',
            category: p.category || 'Mouse',
            totalQuantity: p.totalQuantity !== undefined ? p.totalQuantity : '',
            lowStockThreshold: p.lowStockThreshold !== undefined ? p.lowStockThreshold : 5,
            price: p.price !== undefined ? p.price : '',
            condition: p.condition || 'New',
            location: p.location || 'Store Room',
            pendingPurchase: Boolean(p.pendingPurchase),
            purchaseDate: p.purchaseDate ? new Date(p.purchaseDate).toISOString().split('T')[0] : ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Are you sure you want to delete this stock item?")) return;
        try {
            await axios.delete(`/assets/products/${id}`);
            toast.success("Stock item deleted");
            fetchAllData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete item");
        }
    };

    // ================= Repair Actions =================
    const handleCreateRepair = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await axios.post('/assets/repairs', repairForm);
            toast.success("Asset sent to Repair Hub");
            setRepairForm({
                assetId: '',
                problemDescription: '',
                vendor: 'IT Repair Center',
                estimatedCost: '',
                startDate: new Date().toISOString().split('T')[0]
            });
            fetchAllData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create repair log");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateRepairStatus = async (id, status, actualCost = 0) => {
        try {
            await axios.put(`/assets/repairs/${id}`, { status, actualCost });
            toast.success(`Repair status updated to ${status}`);
            fetchAllData();
        } catch (error) {
            toast.error("Failed to update repair log");
        }
    };

    // ================= Distribution Actions =================
    const handleDistribute = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const managerName = user?.name || localStorage.getItem('userName') || 'Manoj Sir';
            await axios.post('/assets/distribute', {
                ...distForm,
                distributedBy: managerName
            });
            toast.success("Product distributed to employee");
            setDistForm({
                productId: '',
                employeeId: '',
                quantityAssigned: 1,
                distributionDate: new Date().toISOString().split('T')[0],
                remarks: ''
            });
            fetchAllData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to distribute");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReturn = async (id) => {
        if (!window.confirm("Mark this item as returned?")) return;
        try {
            await axios.post(`/assets/return/${id}`);
            toast.success("Item returned to stock");
            fetchAllData();
        } catch (error) {
            toast.error("Failed to return item");
        }
    };

    // Export Reports
    const handleExportCSV = () => {
        if (assets.length === 0 && products.length === 0) {
            toast.error("No data available to export");
            return;
        }

        const headers = ["Asset Tag / ID", "Item Name", "Category", "Location", "Status", "Assignee / Department", "Valuation (INR)"];
        const assetRows = assets.map(a => [
            `"${a.assetId || 'N/A'}"`,
            `"${a.itemName}"`,
            `"${a.category}"`,
            `"${a.location || 'Chandigarh Office'}"`,
            `"${a.status}"`,
            `"${a.assignedTo?.name || 'Unassigned'} (${a.department || 'N/A'})"`,
            a.cost || 0
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...assetRows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `ITAM_Enterprise_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Enterprise ITAM report downloaded");
    };

    // Filtered lists
    const filteredAssets = assets.filter(a => {
        const matchSearch = (a.itemName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (a.assetId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (a.serialNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (a.location || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat = filterCategory === 'All' || a.category === filterCategory;
        const matchStat = filterStatus === 'All' || a.status === filterStatus;
        return matchSearch && matchCat && matchStat;
    });

    const filteredProducts = products.filter(p => {
        const matchSearch = (p.modelName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.location || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat = filterCategory === 'All' || p.category === filterCategory;
        return matchSearch && matchCat;
    });

    // RENDER TAB 1: OVERVIEW & ANALYTICS DASHBOARD
    const renderOverviewTab = () => {
        const overview = stats?.assetOverview || {};
        const inventory = stats?.inventorySummary || {};
        const accessories = stats?.accessoriesBreakdown || {};
        const alerts = stats?.alerts || {};

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Section 1: IT Assets Overview (Hardware) */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <Cpu className="text-indigo-600" size={22} />
                            1. IT Asset Overview (Hardware)
                        </h2>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                            Total Valuation: ₹{(overview.totalValuation || 0).toLocaleString('en-IN')}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Assets</p>
                            <p className="text-3xl font-black text-slate-900 mt-2">{overview.total || 0}</p>
                            <span className="text-[10px] font-bold text-slate-400 mt-1 block">Hardware Systems</span>
                        </div>
                        <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 shadow-sm">
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Assets In Use</p>
                            <p className="text-3xl font-black text-emerald-700 mt-2">{overview.inUse || 0}</p>
                            <span className="text-[10px] font-bold text-emerald-600 mt-1 block">Assigned to Staff</span>
                        </div>
                        <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 shadow-sm">
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Available Assets</p>
                            <p className="text-3xl font-black text-indigo-700 mt-2">{overview.available || 0}</p>
                            <span className="text-[10px] font-bold text-indigo-600 mt-1 block">Ready in Stock</span>
                        </div>
                        <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100 shadow-sm">
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Under Repair</p>
                            <p className="text-3xl font-black text-amber-700 mt-2">{overview.underRepair || 0}</p>
                            <span className="text-[10px] font-bold text-amber-600 mt-1 block">In Service / Vendor</span>
                        </div>
                        <div className="bg-slate-100/70 p-5 rounded-2xl border border-slate-200 shadow-sm">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Retired</p>
                            <p className="text-3xl font-black text-slate-700 mt-2">{overview.retired || 0}</p>
                            <span className="text-[10px] font-bold text-slate-500 mt-1 block">End of Life</span>
                        </div>
                        <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100 shadow-sm">
                            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Scrap / Lost</p>
                            <p className="text-3xl font-black text-rose-700 mt-2">{(overview.scrap || 0) + (overview.lostDamaged || 0)}</p>
                            <span className="text-[10px] font-bold text-rose-600 mt-1 block">Damaged / Written off</span>
                        </div>
                    </div>
                </div>

                {/* Section 2: Consumables & Stock Summary */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <Inbox className="text-emerald-600" size={22} />
                            2. Consumable Inventory & Stock Value
                        </h2>
                        <span className="text-xs font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                            Stock Valuation: ₹{(inventory.totalStockValue || 0).toLocaleString('en-IN')}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Stock Items</p>
                            <p className="text-3xl font-black text-slate-900 mt-2">{inventory.totalStockItems || 0}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1">{(inventory.totalQuantity || 0)} Total Units</p>
                        </div>
                        <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-100 shadow-sm">
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Low Stock Items</p>
                            <p className="text-3xl font-black text-amber-700 mt-2">{inventory.lowStockCount || 0}</p>
                            <p className="text-[10px] font-bold text-amber-600 mt-1">Below Minimum Limit</p>
                        </div>
                        <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100 shadow-sm">
                            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Out of Stock</p>
                            <p className="text-3xl font-black text-rose-700 mt-2">{inventory.outOfStockCount || 0}</p>
                            <p className="text-[10px] font-bold text-rose-600 mt-1">0 Available Units</p>
                        </div>
                        <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 shadow-sm">
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Pending Purchases</p>
                            <p className="text-3xl font-black text-indigo-700 mt-2">{inventory.pendingPurchases || 0}</p>
                            <p className="text-[10px] font-bold text-indigo-600 mt-1">Re-order Requested</p>
                        </div>
                    </div>
                </div>

                {/* Section 3: Accessories Breakdown Grid */}
                <div>
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-4">
                        <HardDrive className="text-sky-600" size={22} />
                        3. Accessories & Stock Items Breakdown
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 text-center shadow-sm">
                            <MousePointer className="mx-auto text-indigo-500 mb-2" size={20} />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mouse</p>
                            <p className="text-xl font-black text-slate-900 mt-1">{accessories.Mouse || 0}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 text-center shadow-sm">
                            <Keyboard className="mx-auto text-emerald-500 mb-2" size={20} />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Keyboard</p>
                            <p className="text-xl font-black text-slate-900 mt-1">{accessories.Keyboard || 0}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 text-center shadow-sm">
                            <Headphones className="mx-auto text-sky-500 mb-2" size={20} />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Headset</p>
                            <p className="text-xl font-black text-slate-900 mt-1">{accessories.Headset || 0}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 text-center shadow-sm">
                            <Zap className="mx-auto text-amber-500 mb-2" size={20} />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Charger</p>
                            <p className="text-xl font-black text-slate-900 mt-1">{accessories.Charger || 0}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 text-center shadow-sm">
                            <Tag className="mx-auto text-rose-500 mb-2" size={20} />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cable</p>
                            <p className="text-xl font-black text-slate-900 mt-1">{accessories.Cable || 0}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 text-center shadow-sm">
                            <Zap className="mx-auto text-purple-500 mb-2" size={20} />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adapter</p>
                            <p className="text-xl font-black text-slate-900 mt-1">{accessories.Adapter || 0}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 text-center shadow-sm">
                            <Cpu className="mx-auto text-blue-600 mb-2" size={20} />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RAM</p>
                            <p className="text-xl font-black text-slate-900 mt-1">{accessories.RAM || 0}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 text-center shadow-sm">
                            <HardDrive className="mx-auto text-teal-600 mb-2" size={20} />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SSD</p>
                            <p className="text-xl font-black text-slate-900 mt-1">{accessories.SSD || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Section 4: Live Alerts Center */}
                <div>
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-4">
                        <AlertTriangle className="text-rose-600" size={22} />
                        4. ITAM Alerts & Notifications Center
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Expiry Alerts */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 text-amber-600">
                                <Clock size={20} />
                                <h3 className="font-black text-sm uppercase tracking-wider">Warranty / AMC / License Expiries</h3>
                            </div>
                            {((alerts.warrantyExpiringSoon || []).length === 0 && (alerts.amcExpiringSoon || []).length === 0 && (alerts.licenseExpiringSoon || []).length === 0) ? (
                                <p className="text-xs font-bold text-slate-400 italic">No expiries within 30 days</p>
                            ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {(alerts.warrantyExpiringSoon || []).map((item, idx) => (
                                        <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs flex justify-between items-center">
                                            <div>
                                                <span className="font-black text-amber-900">{item.name} ({item.tag})</span>
                                                <p className="text-[10px] text-amber-700">Warranty Expiring: {new Date(item.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Low Stock Alerts */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 text-rose-600">
                                <AlertCircle size={20} />
                                <h3 className="font-black text-sm uppercase tracking-wider">Low Stock Inventory Alerts</h3>
                            </div>
                            {(alerts.lowStockItems || []).length === 0 ? (
                                <p className="text-xs font-bold text-slate-400 italic">All consumable stocks healthy</p>
                            ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {(alerts.lowStockItems || []).map((item, idx) => (
                                        <div key={idx} className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs flex justify-between items-center">
                                            <div>
                                                <span className="font-black text-rose-900">{item.name} ({item.category})</span>
                                                <p className="text-[10px] text-rose-700">Available: {item.available} units (Limit: {item.threshold})</p>
                                            </div>
                                            <span className="px-2 py-0.5 bg-rose-200 text-rose-800 rounded font-black text-[9px] uppercase">Re-order</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Pending Repairs */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 text-indigo-600">
                                <Wrench size={20} />
                                <h3 className="font-black text-sm uppercase tracking-wider">Active Device Repairs</h3>
                            </div>
                            {(alerts.repairPendingItems || []).length === 0 ? (
                                <p className="text-xs font-bold text-slate-400 italic">No devices currently in repair</p>
                            ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {(alerts.repairPendingItems || []).map((item, idx) => (
                                        <div key={idx} className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs flex justify-between items-center">
                                            <div>
                                                <span className="font-black text-indigo-900">{item.itemName} ({item.tag})</span>
                                                <p className="text-[10px] text-indigo-700">{item.problem}</p>
                                            </div>
                                            <span className="px-2 py-0.5 bg-indigo-200 text-indigo-800 rounded font-black text-[9px] uppercase">In Repair</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // RENDER TAB 2: FIXED IT HARDWARE ASSETS
    const renderFixedAssetsTab = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Asset Form */}
            <div className="lg:col-span-1">
                <div className={`bg-white p-8 rounded-[32px] border transition-all ${editingAsset ? 'border-indigo-400 ring-2 ring-indigo-100 shadow-2xl' : 'border-slate-200/60 shadow-xl shadow-slate-200/10'}`}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${editingAsset ? 'bg-indigo-50 text-indigo-600' : 'bg-brand-50 text-brand-600'}`}>
                            {editingAsset ? <Edit2 size={20} /> : <Plus size={20} />}
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">{editingAsset ? 'Edit Fixed Asset' : 'Register Fixed IT Asset'}</h2>
                            {editingAsset && (
                                <p className="text-xs font-bold text-indigo-600">Editing Tag: {editingAsset.assetId || editingAsset.itemName}</p>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSaveAsset} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Tag ID</label>
                                <input
                                    type="text"
                                    value={assetForm.assetId}
                                    onChange={(e) => setAssetForm({ ...assetForm, assetId: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-500/20 transition-all uppercase"
                                    placeholder="e.g. IT-LAP-00125"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                <select
                                    value={assetForm.category}
                                    onChange={(e) => setAssetForm({ ...assetForm, category: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-500/20 transition-all cursor-pointer"
                                >
                                    <option value="Laptop">Laptop</option>
                                    <option value="Computer">Computer / Desktop</option>
                                    <option value="Server">Server</option>
                                    <option value="Monitor">Monitor</option>
                                    <option value="Printer">Printer</option>
                                    <option value="Network Equipment">Network Equipment</option>
                                    <option value="Software License">Software License</option>
                                    <option value="Other">Other Hardware</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Item Name</label>
                            <input
                                type="text"
                                required
                                value={assetForm.itemName}
                                onChange={(e) => setAssetForm({ ...assetForm, itemName: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-500/20 transition-all"
                                placeholder="e.g. Lenovo ThinkPad L14 Gen 3"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Serial Number</label>
                                <input
                                    type="text"
                                    value={assetForm.serialNumber}
                                    onChange={(e) => setAssetForm({ ...assetForm, serialNumber: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-500/20 transition-all"
                                    placeholder="S/N Tag"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Purchase Cost (₹)</label>
                                <input
                                    type="number"
                                    required
                                    value={assetForm.cost}
                                    onChange={(e) => setAssetForm({ ...assetForm, cost: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-500/20 transition-all"
                                    placeholder="55000"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location / Store</label>
                                <input
                                    type="text"
                                    value={assetForm.location}
                                    onChange={(e) => setAssetForm({ ...assetForm, location: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-500/20 transition-all"
                                    placeholder="e.g. Chandigarh Office - Room 102"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
                                <select
                                    value={assetForm.department}
                                    onChange={(e) => setAssetForm({ ...assetForm, department: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-500/20 transition-all cursor-pointer"
                                >
                                    <option value="Accounts">Accounts</option>
                                    <option value="IT / Admin">IT / Admin</option>
                                    <option value="Development">Development</option>
                                    <option value="SEO / Marketing">SEO / Marketing</option>
                                    <option value="HR">HR</option>
                                    <option value="Management">Management</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign to Employee</label>
                                <select
                                    value={assetForm.assignedTo}
                                    onChange={(e) => setAssetForm({ ...assetForm, assignedTo: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-500/20 transition-all cursor-pointer"
                                >
                                    <option value="">Unassigned (In Stock)</option>
                                    {employees.map(e => (
                                        <option key={e._id} value={e._id}>{e.name} ({e.department || 'Staff'})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                                <select
                                    value={assetForm.status}
                                    onChange={(e) => setAssetForm({ ...assetForm, status: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-500/20 transition-all cursor-pointer"
                                >
                                    <option value="Available">Available</option>
                                    <option value="In Use">In Use / Assigned</option>
                                    <option value="Under Repair">Under Repair</option>
                                    <option value="Retired">Retired</option>
                                    <option value="Scrap">Scrap</option>
                                    <option value="Lost/Damaged">Lost / Damaged</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Purchase Date</label>
                                <input
                                    type="date"
                                    value={assetForm.purchaseDate}
                                    onChange={(e) => setAssetForm({ ...assetForm, purchaseDate: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-500/20 transition-all"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Warranty Expiry</label>
                                <input
                                    type="date"
                                    value={assetForm.warrantyExpiry}
                                    onChange={(e) => setAssetForm({ ...assetForm, warrantyExpiry: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-500/20 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 bg-slate-900 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-slate-900/10"
                            >
                                {submitting ? 'Saving...' : editingAsset ? 'Update Asset' : 'Save Fixed Asset'}
                            </button>
                            {editingAsset && (
                                <button
                                    type="button"
                                    onClick={() => setEditingAsset(null)}
                                    className="px-5 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Assets Table */}
            <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-xl shadow-slate-200/10 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-black text-slate-900">IT Hardware Assets Catalog</h2>
                            <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {filteredAssets.length} Assets
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search Asset Tag / Name / Location..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 w-48 sm:w-60"
                                />
                            </div>
                            <button
                                onClick={handleExportCSV}
                                className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 transition-all shadow-sm"
                                title="Export Report CSV"
                            >
                                <Download size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white border-b border-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Tag</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item & Category</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignee / Dept</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-16 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto" />
                                        </td>
                                    </tr>
                                ) : filteredAssets.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-16 text-center text-slate-400 font-bold italic">
                                            No matching IT assets found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAssets.map(a => (
                                        <tr key={a._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-black tracking-wider">
                                                    {a.assetId || 'IT-AST-REF'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-black text-slate-900 leading-tight">{a.itemName}</p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-0.5">{a.category} • ₹{a.cost || 0}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                {a.assignedTo ? (
                                                    <div>
                                                        <p className="text-xs font-black text-indigo-600 leading-tight">{a.assignedTo.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{a.department || 'Accounts'}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-slate-400 italic">Unassigned (Stock)</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-slate-600 text-xs font-bold">
                                                    <MapPin size={14} className="text-slate-400" />
                                                    <span>{a.location || 'Chandigarh Office'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                    a.status === 'In Use' || a.status === 'Assigned' ? 'bg-emerald-100 text-emerald-700' :
                                                    a.status === 'Available' ? 'bg-indigo-100 text-indigo-700' :
                                                    a.status === 'Under Repair' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                    {a.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => startEditAsset(a)}
                                                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                        title="Edit Asset"
                                                    >
                                                        <Edit2 size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAsset(a._id)}
                                                        className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                        title="Delete Asset"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );

    // RENDER TAB 3: CONSUMABLE ACCESSORIES & PARTS STOCK
    const renderAccessoriesTab = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Form Column */}
            <div className="lg:col-span-1">
                <div className={`bg-white p-8 rounded-[32px] border transition-all ${editingProduct ? 'border-indigo-400 ring-2 ring-indigo-100 shadow-2xl' : 'border-slate-200/60 shadow-xl shadow-slate-200/10'}`}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${editingProduct ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {editingProduct ? <Edit2 size={20} /> : <Plus size={20} />}
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">{editingProduct ? 'Edit Stock Item' : 'Add Accessory / Part'}</h2>
                            {editingProduct && (
                                <p className="text-xs font-bold text-indigo-600">Editing: {editingProduct.modelName}</p>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSaveProduct} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                            <select
                                value={productForm.category}
                                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-500/20 transition-all cursor-pointer"
                            >
                                <option value="Mouse">Mouse</option>
                                <option value="Keyboard">Keyboard</option>
                                <option value="Headset">Headset</option>
                                <option value="Charger">Charger</option>
                                <option value="Cable">Cable</option>
                                <option value="Adapter">Adapter</option>
                                <option value="RAM">RAM</option>
                                <option value="SSD">SSD</option>
                                <option value="General Hardware">General Hardware</option>
                                <option value="Other">Other Accessories</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Item / Model Name</label>
                            <input
                                type="text"
                                required
                                value={productForm.modelName}
                                onChange={(e) => setProductForm({ ...productForm, modelName: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-500/20 transition-all"
                                placeholder="e.g. Logitech Wireless Mouse B170"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Quantity</label>
                                <input
                                    type="number"
                                    required
                                    value={productForm.totalQuantity}
                                    onChange={(e) => setProductForm({ ...productForm, totalQuantity: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-500/20 transition-all"
                                    placeholder="10"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Low Stock Limit</label>
                                <input
                                    type="number"
                                    value={productForm.lowStockThreshold}
                                    onChange={(e) => setProductForm({ ...productForm, lowStockThreshold: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-500/20 transition-all"
                                    placeholder="5"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Price (₹)</label>
                                <input
                                    type="number"
                                    required
                                    value={productForm.price}
                                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-500/20 transition-all"
                                    placeholder="650"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Storage Location</label>
                                <input
                                    type="text"
                                    value={productForm.location}
                                    onChange={(e) => setProductForm({ ...productForm, location: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-500/20 transition-all"
                                    placeholder="Store Room - Rack B"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <input
                                type="checkbox"
                                id="pendingPurchase"
                                checked={productForm.pendingPurchase}
                                onChange={(e) => setProductForm({ ...productForm, pendingPurchase: e.target.checked })}
                                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <label htmlFor="pendingPurchase" className="text-xs font-bold text-slate-700 cursor-pointer">
                                Mark as Pending Re-order / Purchase
                            </label>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 bg-slate-900 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-slate-900/10"
                            >
                                {submitting ? 'Saving...' : editingProduct ? 'Update Stock Item' : 'Save Stock Record'}
                            </button>
                            {editingProduct && (
                                <button
                                    type="button"
                                    onClick={() => setEditingProduct(null)}
                                    className="px-5 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* List Column */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-xl shadow-slate-200/10 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/30">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-black text-slate-900">Accessories & Consumables Catalog</h2>
                            <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {filteredProducts.length} Items
                            </span>
                        </div>
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search stock items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-300 w-48 sm:w-64"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white border-b border-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category & Model</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Qty</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Stock</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price / Value</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-16 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto" />
                                        </td>
                                    </tr>
                                ) : filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-16 text-center text-slate-400 font-bold italic">
                                            No accessories found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map(p => {
                                        const isLow = (p.availableQuantity || 0) <= (p.lowStockThreshold || 5);
                                        return (
                                            <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-black uppercase">
                                                            {p.category || 'Hardware'}
                                                        </span>
                                                        {p.pendingPurchase && (
                                                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[9px] font-black uppercase">
                                                                Pending Order
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-black text-slate-900 mt-1">{p.modelName}</p>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-slate-600 text-xs">{p.totalQuantity} Units</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2.5 py-1 rounded-xl text-xs font-black ${
                                                            p.availableQuantity === 0 ? 'bg-rose-100 text-rose-700' :
                                                            isLow ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                                        }`}>
                                                            {p.availableQuantity} Units
                                                        </span>
                                                        {isLow && <AlertCircle size={14} className="text-amber-500" title="Low Stock Warning" />}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-xs font-black text-slate-900">₹{p.price}</p>
                                                    <p className="text-[10px] font-bold text-slate-400">Total: ₹{(p.availableQuantity * p.price).toLocaleString('en-IN')}</p>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-bold text-slate-500">
                                                    {p.location || 'Store Room'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => startEditProduct(p)}
                                                            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                            title="Edit Stock"
                                                        >
                                                            <Edit2 size={15} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProduct(p._id)}
                                                            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                            title="Delete Stock"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );

    // RENDER TAB 4: SERVICE & REPAIR HUB
    const renderRepairsTab = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Create Repair Form */}
            <div className="lg:col-span-1">
                <div className="bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-xl shadow-slate-200/10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                            <Wrench size={20} />
                        </div>
                        <h2 className="text-xl font-black text-slate-900">Send Device to Repair</h2>
                    </div>

                    <form onSubmit={handleCreateRepair} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Hardware Asset</label>
                            <select
                                required
                                value={repairForm.assetId}
                                onChange={(e) => setRepairForm({ ...repairForm, assetId: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-500/20 transition-all cursor-pointer"
                            >
                                <option value="">Select Hardware Item...</option>
                                {assets.map(a => (
                                    <option key={a._id} value={a._id}>
                                        {a.assetId || 'IT-AST'} - {a.itemName} ({a.status})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Problem Description</label>
                            <textarea
                                required
                                value={repairForm.problemDescription}
                                onChange={(e) => setRepairForm({ ...repairForm, problemDescription: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-500/20 transition-all h-24 resize-none"
                                placeholder="Describe issue (e.g. Display backlight faulty / RAM slot dead)"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Repair Vendor / Tech</label>
                                <input
                                    type="text"
                                    value={repairForm.vendor}
                                    onChange={(e) => setRepairForm({ ...repairForm, vendor: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-500/20 transition-all"
                                    placeholder="Lenovo Support Care"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Est. Cost (₹)</label>
                                <input
                                    type="number"
                                    value={repairForm.estimatedCost}
                                    onChange={(e) => setRepairForm({ ...repairForm, estimatedCost: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-500/20 transition-all"
                                    placeholder="2500"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-amber-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-700 transition-all active:scale-95 disabled:opacity-50 mt-2 shadow-xl shadow-amber-600/10"
                        >
                            {submitting ? 'Processing...' : 'Dispatch for Service / Repair'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Repair Logs Table */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-xl shadow-slate-200/10 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <h2 className="text-lg font-black text-slate-900">Service & Repair Logs</h2>
                        <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {repairs.length} Repair Records
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white border-b border-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Tag & Device</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Problem Description</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendor & Cost</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center">
                                            <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto" />
                                        </td>
                                    </tr>
                                ) : repairs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center text-slate-400 font-bold italic">No repair logs recorded</td>
                                    </tr>
                                ) : (
                                    repairs.map(r => (
                                        <tr key={r._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-black">
                                                    {r.assetIdTag || 'IT-AST'}
                                                </span>
                                                <p className="text-sm font-black text-slate-900 mt-1">{r.itemName}</p>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-600">
                                                {r.problemDescription}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs font-black text-slate-900">{r.vendor}</p>
                                                <p className="text-[10px] font-bold text-slate-400">Est: ₹{r.estimatedCost} | Act: ₹{r.actualCost || 0}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                    r.status === 'Repaired' ? 'bg-emerald-100 text-emerald-700' :
                                                    r.status === 'In Repair' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-rose-100 text-rose-700'
                                                }`}>
                                                    {r.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {r.status === 'In Repair' || r.status === 'Pending' ? (
                                                    <button
                                                        onClick={() => handleUpdateRepairStatus(r._id, 'Repaired', r.estimatedCost)}
                                                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-all shadow-sm"
                                                    >
                                                        Mark Repaired
                                                    </button>
                                                ) : (
                                                    <span className="text-[10px] text-slate-400 font-bold">Done</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );

    // RENDER TAB 5: EMPLOYEE ASSIGNMENTS ("Kis employee ke paas kya hai")
    const renderAllocationsTab = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Consumables Distribution Form & Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Column */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-xl shadow-slate-200/10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <Share2 size={20} />
                            </div>
                            <h2 className="text-xl font-black text-slate-900">Distribute Stock Item</h2>
                        </div>

                        <form onSubmit={handleDistribute} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Accessory / Part</label>
                                <select
                                    required
                                    value={distForm.productId}
                                    onChange={(e) => setDistForm({ ...distForm, productId: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-500/20 transition-all cursor-pointer"
                                >
                                    <option value="">Select Item...</option>
                                    {products.map(p => (
                                        <option key={p._id} value={p._id} disabled={p.availableQuantity === 0}>
                                            {p.modelName} ({p.availableQuantity} available)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Employee</label>
                                <select
                                    required
                                    value={distForm.employeeId}
                                    onChange={(e) => setDistForm({ ...distForm, employeeId: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-500/20 transition-all cursor-pointer"
                                >
                                    <option value="">Assign to Employee...</option>
                                    {employees.map(e => (
                                        <option key={e._id} value={e._id}>{e.name} ({e.department || 'Accounts'})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={distForm.quantityAssigned}
                                        onChange={(e) => setDistForm({ ...distForm, quantityAssigned: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-500/20 transition-all"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={distForm.distributionDate}
                                        onChange={(e) => setDistForm({ ...distForm, distributionDate: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-brand-500/20 transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 mt-2 shadow-xl shadow-indigo-600/10"
                            >
                                {submitting ? 'Processing...' : 'Assign Stock Item'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Distribution Logs */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-xl shadow-slate-200/10 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                            <h2 className="text-lg font-black text-slate-900">Accessories Allocation Logs</h2>
                            <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {distributions.length} Records
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white border-b border-slate-50">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessory / Item</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100/50">
                                    {distributions.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-16 text-center text-slate-400 font-bold italic">No accessory distributions recorded</td>
                                        </tr>
                                    ) : (
                                        distributions.map(d => (
                                            <tr key={d._id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-black text-slate-900 leading-tight">{d.employee?.name || 'Rahul'}</p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5 font-bold">{d.employee?.department || 'Accounts'}</p>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-slate-600 text-xs">{d.product?.modelName}</td>
                                                <td className="px-6 py-4 font-black text-slate-900 text-xs">{d.quantityAssigned} Units</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                        d.status === 'Assigned' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                                                    }`}>
                                                        {d.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {d.status === 'Assigned' ? (
                                                        <button
                                                            onClick={() => handleReturn(d._id)}
                                                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                            title="Process Return to Stock"
                                                        >
                                                            <ArrowRightLeft size={16} />
                                                        </button>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-400 font-bold">Returned</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-8 max-w-[1700px] mx-auto min-h-screen bg-slate-50/50 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-4 py-1.5 bg-brand-100 text-brand-700 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                            Enterprise ITAM Suite v3.0
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">IT Asset & Inventory Control Center</h1>
                    <p className="text-slate-500 font-bold text-base max-w-3xl">
                        Hardware tracking (Computers, Laptops, Servers), Accessories Stock (RAM, SSD, Mouse), Repairs Hub & Expiry Alerts.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchAllData}
                        className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-700 hover:bg-slate-100 transition-all uppercase tracking-wider shadow-sm active:scale-95"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black hover:bg-slate-800 transition-all uppercase tracking-wider shadow-xl shadow-slate-900/10 active:scale-95"
                    >
                        <Download size={16} />
                        Export Master CSV
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center gap-2.5 px-6 py-3.5 rounded-[22px] font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap border shadow-sm ${
                        activeTab === 'overview'
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                >
                    <Cpu size={18} />
                    Overview & Analytics
                </button>
                <button
                    onClick={() => setActiveTab('fixedAssets')}
                    className={`flex items-center gap-2.5 px-6 py-3.5 rounded-[22px] font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap border shadow-sm ${
                        activeTab === 'fixedAssets'
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-600/20'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                >
                    <Package size={18} />
                    Fixed IT Hardware ({assets.length})
                </button>
                <button
                    onClick={() => setActiveTab('accessories')}
                    className={`flex items-center gap-2.5 px-6 py-3.5 rounded-[22px] font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap border shadow-sm ${
                        activeTab === 'accessories'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-600/20'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                >
                    <Inbox size={18} />
                    Consumables & Parts ({products.length})
                </button>
                <button
                    onClick={() => setActiveTab('repairs')}
                    className={`flex items-center gap-2.5 px-6 py-3.5 rounded-[22px] font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap border shadow-sm ${
                        activeTab === 'repairs'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xl shadow-amber-600/20'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                >
                    <Wrench size={18} />
                    Service & Repairs ({repairs.length})
                </button>
                <button
                    onClick={() => setActiveTab('allocations')}
                    className={`flex items-center gap-2.5 px-6 py-3.5 rounded-[22px] font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap border shadow-sm ${
                        activeTab === 'allocations'
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xl shadow-purple-600/20'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                >
                    <Share2 size={18} />
                    Employee Allocations
                </button>
            </div>

            {/* Content Area */}
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'fixedAssets' && renderFixedAssetsTab()}
            {activeTab === 'accessories' && renderAccessoriesTab()}
            {activeTab === 'repairs' && renderRepairsTab()}
            {activeTab === 'allocations' && renderAllocationsTab()}
        </div>
    );
};

export default AdminAssetManagement;
