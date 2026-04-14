import React, { useState, useEffect } from 'react';
import { ownerAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './ScreenManagement.css';

const ScreenManagement = () => {
  const [theaters, setTheaters] = useState([]);
  const [selectedTheater, setSelectedTheater] = useState('');
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingScreen, setEditingScreen] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    rows: 8,
    columns: 10,
    totalSeates: 80,
    theater: { id: '' }
  });

  useEffect(() => {
    fetchMyTheaters();
  }, []);

  const fetchMyTheaters = async () => {
    try {
      const response = await ownerAPI.getMyTheaters();
      setTheaters(response.data);
    } catch (error) {
      console.error('Error fetching theaters:', error);
      toast.error('Failed to load theaters');
    }
  };

  const fetchScreens = async (theaterId) => {
  if (!theaterId) return;
  setLoading(true);
  try {
    const response = await ownerAPI.getTheaterScreens(theaterId);

    setScreens(response.data);
  } catch (error) {
    console.error('Error fetching screens:', error);
    toast.error('Failed to load screens');
  } finally {
    setLoading(false);
  }
};

  const handleTheaterChange = (e) => {
    const theaterId = e.target.value;
    setSelectedTheater(theaterId);
    setFormData({ ...formData, theater: { id: parseInt(theaterId) } });
    if (theaterId) {
      fetchScreens(theaterId);
    } else {
      setScreens([]);
    }
  };
const handleInputChange = (e) => {
  const { name, value } = e.target;

  const updatedForm = {
    ...formData,
    [name]: name === 'rows' || name === 'columns' ? Number(value) : value
  };

  // Auto-calculate seats
  updatedForm.totalSeates = updatedForm.rows * updatedForm.columns;

  setFormData(updatedForm);
};

  const handleRowsColumnsChange = () => {
    const totalSeats = formData.rows * formData.columns;
    setFormData({
      ...formData,
      totalSeates: totalSeats
    });
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    
    const screenData = {
        name: formData.name,
        rows: formData.rows,
        columns: formData.columns,
        totalSeats: formData.rows * formData.columns,
        theaterId: parseInt(selectedTheater)  // Send theaterId directly
    };

    try {
        if (editingScreen) {
            await ownerAPI.updateScreen(editingScreen.id, screenData);
            toast.success('Screen updated successfully');
        } else {
            await ownerAPI.createScreen(screenData);
            toast.success('Screen created successfully');
        }
        setShowModal(false);
        resetForm();
        fetchScreens(selectedTheater);
    } catch (error) {
        console.error('Error saving screen:', error);
        toast.error(error.response?.data || 'Failed to save screen');
    }
};

  const handleEdit = (screen) => {
    setEditingScreen(screen);
    setFormData({
      name: screen.name,
      rows: screen.rows,
      columns: screen.columnCount,
      totalSeates: screen.totalSeats,
      theater: screen.theater
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this screen? This will also delete all associated seats and shows.')) {
      try {
        await ownerAPI.deleteScreen(id);
        toast.success('Screen deleted successfully');
        fetchScreens(selectedTheater);
      } catch (error) {
        console.error('Error deleting screen:', error);
        toast.error('Failed to delete screen');
      }
    }
  };

  const resetForm = () => {
    setEditingScreen(null);
    setFormData({
      name: '',
      rows: 8,
      columns: 10,
      totalSeates: 80,
      theater: { id: selectedTheater ? parseInt(selectedTheater) : '' }
    });
  };

  const generateSeatLayout = (rows, cols) => {
    const layout = [];
    const seatTypes = ['Platinum', 'Gold', 'Silver'];
    
    for (let i = 0; i < rows; i++) {
      const rowSeats = [];
      let seatType = '';
      if (i === 0) seatType = 'Platinum ($15)';
      else if (i <= 2) seatType = 'Gold ($12)';
      else seatType = 'Silver ($10)';
      
      for (let j = 0; j < cols; j++) {
        rowSeats.push(`${String.fromCharCode(65 + i)}${j + 1}`);
      }
      layout.push({ row: String.fromCharCode(65 + i), seats: rowSeats, type: seatType });
    }
    return layout;
  };

  return (
    <div className="screen-management">
      <div className="container">
        <div className="management-header">
          <h1>Screen Management</h1>
          <button 
            className="btn-primary" 
            onClick={() => {
              if (!selectedTheater) {
                toast.error('Please select a theater first');
                return;
              }
              resetForm();
              setShowModal(true);
            }}
            disabled={!selectedTheater}
          >
            + Add New Screen
          </button>
        </div>

        <div className="theater-selector">
          <label>Select Theater:</label>
          <select value={selectedTheater} onChange={handleTheaterChange}>
            <option value="">Choose a theater</option>
            {theaters.map(theater => (
              <option key={theater.id} value={theater.id}>
                {theater.name} - {theater.city}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : screens.length === 0 && selectedTheater ? (
          <div className="no-data">
            <p>No screens found for this theater. Add your first screen!</p>
          </div>
        ) : screens.length > 0 ? (
          <div className="screens-list">
            {screens.map((screen) => (
              <div key={screen.id} className="screen-card">
                <div className="screen-header">
                  <div>
                    <h3>{screen.name}</h3>
                    <p className="screen-stats">
                      {screen.rows} rows × {screen.columnCount} columns | 
                      Total Seats: {screen.totalSeats}
                    </p>
                  </div>
                  <div className="screen-actions">
                    <button className="edit-btn" onClick={() => handleEdit(screen)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(screen.id)}>Delete</button>
                  </div>
                </div>
                
                <div className="seat-layout-preview">
                  <div className="screen-label">SCREEN</div>
                  <div className="seat-preview">
                    {generateSeatLayout(screen.rows, screen.columnCount).map((row) => (
                      <div key={row.row} className="seat-row">
                        <span className="row-label">{row.row}</span>
                        <div className="seats">
                          {row.seats.map((seat) => (
                            <div key={seat} className={`preview-seat ${row.type.split(' ')[0].toLowerCase()}`}>
                              {seat}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="seat-legend-preview">
                    <div className="legend-item">
                      <div className="preview-seat platinum"></div>
                      <span>Platinum ($15)</span>
                    </div>
                    <div className="legend-item">
                      <div className="preview-seat gold"></div>
                      <span>Gold ($12)</span>
                    </div>
                    <div className="legend-item">
                      <div className="preview-seat silver"></div>
                      <span>Silver ($10)</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingScreen ? 'Edit Screen' : 'Add New Screen'}</h2>
                <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Screen Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Screen 1, IMAX, 4K Screen"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Number of Rows *</label>
                    <input
                      type="number"
                      name="rows"
                      value={formData.rows}
                      onChange={(e) => {
                        handleInputChange(e);
                      }}
                      min="1"
                      max="15"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Number of Columns *</label>
                    <input
                      type="number"
                      name="columns"
                      value={formData.columns}
                      onChange={(e) => {
                        handleInputChange(e);
                      }}
                      min="1"
                      max="20"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Total Seats (Auto-calculated)</label>
                  <input
                    type="text"
                    value={formData.rows * formData.columns}
                    disabled
                    className="readonly"
                  />
                </div>

                <div className="seat-config-preview">
                  <h4>Seat Layout Preview:</h4>
                  <div className="mini-layout">
                    {generateSeatLayout(Math.min(formData.rows, 5), Math.min(formData.columns, 8)).map((row) => (
                      <div key={row.row} className="mini-row">
                        <span className="mini-row-label">{row.row}</span>
                        {row.seats.map((seat) => (
                          <div key={seat} className={`mini-seat ${row.type.split(' ')[0].toLowerCase()}`}>
                            {seat}
                          </div>
                        ))}
                      </div>
                    ))}
                    {formData.rows > 5 && <div className="mini-more">... and {formData.rows - 5} more rows</div>}
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingScreen ? 'Update' : 'Create'} Screen
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreenManagement;