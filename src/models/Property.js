const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  propertyId: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Property type is required'],
    enum: ['Apartment', 'Villa', 'Studio', 'Penthouse', 'Bungalow']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  state: {
    type: String,
    required: [true, 'State is required']
  },
  city: {
    type: String,
    required: [true, 'City is required']
  },
  areaSqFt: {
    type: Number,
    required: [true, 'Area is required'],
    min: 0
  },
  bedrooms: {
    type: Number,
    required: true,
    min: 0
  },
  bathrooms: {
    type: Number,
    required: true,
    min: 0
  },
  amenities: [{
    type: String
  }],
  furnished: {
    type: String,
    enum: ['Furnished', 'Unfurnished', 'Semi'],
    required: true
  },
  availableFrom: {
    type: Date,
    required: true
  },
  listedBy: {
    type: String,
    required: true,
    enum: ['Owner', 'Agent', 'Builder']
  },
  tags: [{
    type: String
  }],
  colorTheme: {
    type: String
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  listingType: {
    type: String,
    enum: ['sale', 'rent'],
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [{
    type: String
  }],
  description: {
    type: String
  }
}, {
  timestamps: true
});

propertySchema.index({ price: 1 });
propertySchema.index({ city: 1, state: 1 });
propertySchema.index({ type: 1 });
propertySchema.index({ bedrooms: 1, bathrooms: 1 });
propertySchema.index({ createdBy: 1 });
propertySchema.index({ listingType: 1 });
propertySchema.index({ 
  title: 'text', 
  description: 'text',
  city: 'text',
  state: 'text' 
});

module.exports = mongoose.model('Property', propertySchema);
