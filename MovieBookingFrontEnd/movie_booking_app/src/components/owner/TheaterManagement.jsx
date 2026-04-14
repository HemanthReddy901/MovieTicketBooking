import React, { useState, useEffect } from 'react';
import { ownerAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './TheaterManagement.css';

const TheaterManagement = () => {
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTheater, setEditingTheater] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    contactNumber: '',
    email: '',
    totalScreens: 1
  });

  useEffect(() => {
    fetchTheaters();
  }, []);

  const fetchTheaters = async () => {
    try {
      const response = await ownerAPI.getMyTheaters();
      setTheaters(response.data);
    } catch (error) {
      console.error('Error fetching theaters:', error);
      toast.error('Failed to load theaters');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTheater) {
        await ownerAPI.updateTheater(editingTheater.id, formData);
        toast.success('Theater updated successfully');
      } else {
        await ownerAPI.createTheater(formData);
        toast.success('Theater created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchTheaters();
    } catch (error) {
      console.error('Error saving theater:', error);
      toast.error(error.response?.data || 'Failed to save theater');
    }
  };

  const handleEdit = (theater) => {
    setEditingTheater(theater);
    setFormData({
      name: theater.name,
      location: theater.location,
      address: theater.address,
      city: theater.city,
      state: theater.state,
      pincode: theater.pincode,
      contactNumber: theater.contactNumber,
      email: theater.email,
      totalScreens: theater.totalScreens
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this theater?')) {
      try {
        await ownerAPI.deleteTheater(id);
        toast.success('Theater deleted successfully');
        fetchTheaters();
      } catch (error) {
        console.error('Error deleting theater:', error);
        toast.error('Failed to delete theater');
      }
    }
  };

  const resetForm = () => {
    setEditingTheater(null);
    setFormData({
      name: '',
      location: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      contactNumber: '',
      email: '',
      totalScreens: 1
    });
  };

  return (
    <div className="theater-management">
      <div className="container">
        <div className="management-header">
          <h1>Theater Management</h1>
          <button className="btn-primary" onClick={() => {
            resetForm();
            setShowModal(true);
          }}>
            + Add New Theater
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : theaters.length === 0 ? (
          <div className="no-data">
            <p>No theaters found. Create your first theater!</p>
          </div>
        ) : (
          <div className="theaters-grid">
            {theaters.map((theater) => (
              <div key={theater.id} className="theater-card">
                <div className="theater-header">
                  <h3>{theater.name}</h3>
                  <div className="theater-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEdit(theater)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(theater.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="theater-details">
                  <p><strong>Location:</strong> {theater.location}</p>
                  <p><strong>Address:</strong> {theater.address}</p>
                  <p><strong>City:</strong> {theater.city}, {theater.state}</p>
                  <p><strong>Pincode:</strong> {theater.pincode}</p>
                  <p><strong>Contact:</strong> {theater.contactNumber}</p>
                  <p><strong>Email:</strong> {theater.email}</p>
                  <p><strong>Total Screens:</strong> {theater.totalScreens}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingTheater ? 'Edit Theater' : 'Add New Theater'}</h2>
                <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Theater Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Address *</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Number *</label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Total Screens *</label>
                    <input
                      type="number"
                      name="totalScreens"
                      value={formData.totalScreens}
                      onChange={handleInputChange}
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingTheater ? 'Update' : 'Create'} Theater
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

export default TheaterManagement;