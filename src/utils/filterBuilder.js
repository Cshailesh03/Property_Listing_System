class FilterBuilder {
  static buildPropertyFilter(queryParams) {
    const filter = {};

    // Price range filter
    if (queryParams.minPrice || queryParams.maxPrice) {
      filter.price = {};
      if (queryParams.minPrice) {
        filter.price.$gte = parseFloat(queryParams.minPrice);
      }
      if (queryParams.maxPrice) {
        filter.price.$lte = parseFloat(queryParams.maxPrice);
      }
    }

    // Property type filter
    if (queryParams.type) {
      const types = Array.isArray(queryParams.type) ? queryParams.type : [queryParams.type];
      filter.type = { $in: types };
    }

    // Location filters
    if (queryParams.state) {
      filter.state = new RegExp(queryParams.state, 'i');
    }
    if (queryParams.city) {
      filter.city = new RegExp(queryParams.city, 'i');
    }

    // Area filter
    if (queryParams.minArea || queryParams.maxArea) {
      filter.areaSqFt = {};
      if (queryParams.minArea) {
        filter.areaSqFt.$gte = parseFloat(queryParams.minArea);
      }
      if (queryParams.maxArea) {
        filter.areaSqFt.$lte = parseFloat(queryParams.maxArea);
      }
    }

    // Bedrooms filter
    if (queryParams.bedrooms) {
      if (queryParams.bedrooms.includes('+')) {
        const minBedrooms = parseInt(queryParams.bedrooms.replace('+', ''));
        filter.bedrooms = { $gte: minBedrooms };
      } else {
        filter.bedrooms = parseInt(queryParams.bedrooms);
      }
    }

    // Bathrooms filter
    if (queryParams.bathrooms) {
      if (queryParams.bathrooms.includes('+')) {
        const minBathrooms = parseInt(queryParams.bathrooms.replace('+', ''));
        filter.bathrooms = { $gte: minBathrooms };
      } else {
        filter.bathrooms = parseInt(queryParams.bathrooms);
      }
    }

    // Amenities filter
    if (queryParams.amenities) {
      const amenities = Array.isArray(queryParams.amenities) 
        ? queryParams.amenities 
        : queryParams.amenities.split(',');
      filter.amenities = { $all: amenities };
    }

    // Furnished status filter
    if (queryParams.furnished) {
      const furnishedOptions = Array.isArray(queryParams.furnished) 
        ? queryParams.furnished 
        : [queryParams.furnished];
      filter.furnished = { $in: furnishedOptions };
    }

    // Available from filter
    if (queryParams.availableFrom) {
      filter.availableFrom = { $lte: new Date(queryParams.availableFrom) };
    }

    // Listed by filter
    if (queryParams.listedBy) {
      const listedByOptions = Array.isArray(queryParams.listedBy) 
        ? queryParams.listedBy 
        : [queryParams.listedBy];
      filter.listedBy = { $in: listedByOptions };
    }

    // Tags filter
    if (queryParams.tags) {
      const tags = Array.isArray(queryParams.tags) 
        ? queryParams.tags 
        : queryParams.tags.split(',');
      filter.tags = { $in: tags };
    }

    // Rating filter
    if (queryParams.minRating) {
      filter.rating = { $gte: parseFloat(queryParams.minRating) };
    }

    // Verified properties only
    if (queryParams.isVerified === 'true') {
      filter.isVerified = true;
    }

    // Listing type filter
    if (queryParams.listingType) {
      filter.listingType = queryParams.listingType;
    }

    // Created by filter (for user's own properties)
    if (queryParams.createdBy) {
      filter.createdBy = queryParams.createdBy;
    }

    // Date range filters
    if (queryParams.createdAfter || queryParams.createdBefore) {
      filter.createdAt = {};
      if (queryParams.createdAfter) {
        filter.createdAt.$gte = new Date(queryParams.createdAfter);
      }
      if (queryParams.createdBefore) {
        filter.createdAt.$lte = new Date(queryParams.createdBefore);
      }
    }

    return filter;
  }

  static buildSortOptions(sortBy) {
    const sortOptions = {};

    switch (sortBy) {
      case 'price_asc':
        sortOptions.price = 1;
        break;
      case 'price_desc':
        sortOptions.price = -1;
        break;
      case 'area_asc':
        sortOptions.areaSqFt = 1;
        break;
      case 'area_desc':
        sortOptions.areaSqFt = -1;
        break;
      case 'rating_desc':
        sortOptions.rating = -1;
        break;
      case 'date_desc':
        sortOptions.createdAt = -1;
        break;
      case 'date_asc':
        sortOptions.createdAt = 1;
        break;
      default:
        sortOptions.createdAt = -1; // Default to newest first
    }

    return sortOptions;
  }
}

module.exports = {
  buildPropertyFilter: FilterBuilder.buildPropertyFilter,
  buildSortOptions: FilterBuilder.buildSortOptions
};
