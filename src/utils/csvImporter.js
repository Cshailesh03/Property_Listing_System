const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Property = require('../models/Property');
const User = require('../models/User');
require('dotenv').config();

class CSVImporter {
  constructor() {
    this.results = [];
    this.errors = [];
  }

  async connectDB() {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB connected for CSV import');
    } catch (error) {
      console.error('MongoDB connection failed:', error);
      process.exit(1);
    }
  }

  async findOrCreateDefaultUser() {
    const email = 'admin@property-listing.com';
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        email,
        password: 'admin123',
        name: 'System Admin'
      });
      console.log('Default admin user created');
    }
    
    return user;
  }

  parseAmenities(amenitiesString) {
    return amenitiesString ? amenitiesString.split('|').map(a => a.trim()) : [];
  }

  parseTags(tagsString) {
    return tagsString ? tagsString.split('|').map(t => t.trim()) : [];
  }

  parseDate(dateString) {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date() : date;
  }

  parseBoolean(value) {
    return value === 'True' || value === 'true' || value === true;
  }

  async importFromCSV(filePath) {
    await this.connectDB();
    const defaultUser = await this.findOrCreateDefaultUser();

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          try {
            const propertyData = {
              propertyId: row.id,
              title: row.title,
              type: row.type,
              price: parseFloat(row.price),
              state: row.state,
              city: row.city,
              areaSqFt: parseFloat(row.areaSqFt),
              bedrooms: parseInt(row.bedrooms),
              bathrooms: parseInt(row.bathrooms),
              amenities: this.parseAmenities(row.amenities),
              furnished: row.furnished,
              availableFrom: this.parseDate(row.availableFrom),
              listedBy: row.listedBy,
              tags: this.parseTags(row.tags),
              colorTheme: row.colorTheme,
              rating: parseFloat(row.rating),
              isVerified: this.parseBoolean(row.isVerified),
              listingType: row.listingType,
              createdBy: defaultUser._id
            };

            this.results.push(propertyData);
          } catch (error) {
            this.errors.push({ row: row.id, error: error.message });
          }
        })
        .on('end', async () => {
          console.log(`CSV file successfully processed. ${this.results.length} rows found.`);
          
          try {
            if (this.results.length > 0) {
              await Property.insertMany(this.results, { ordered: false });
              console.log(`Successfully imported ${this.results.length} properties`);
            }
            
            if (this.errors.length > 0) {
              console.log(`Errors encountered: ${this.errors.length}`);
              console.log(this.errors);
            }
            
            resolve({
              success: this.results.length,
              errors: this.errors.length
            });
          } catch (error) {
            console.error('Error during bulk insert:', error);
            reject(error);
          } finally {
            mongoose.connection.close();
          }
        })
        .on('error', (error) => {
          console.error('Error reading CSV file:', error);
          reject(error);
        });
    });
  }
}

if (require.main === module) {
  const csvPath = path.join(__dirname, 'data', 'properties.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found at path: ${csvPath}`);
    console.error(`Current directory: ${__dirname}`);
    console.error(`Looking for file at: ${path.resolve(csvPath)}`);
    process.exit(1);
  }
  
  const importer = new CSVImporter();
  
  importer.importFromCSV(csvPath)
    .then(result => {
      console.log('Import completed:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('Import failed:', error);
      process.exit(1);
    });
}

module.exports = CSVImporter;
