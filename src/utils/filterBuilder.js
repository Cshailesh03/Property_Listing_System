class FilterBuilder {
  static buildPropertyFilter(queryParams) {
    const filter = {};

    if (queryParams.minPrice || queryParams.maxPrice) {
      filter.price = {};
      if (queryParams.minPrice) {
        filter.price.$gte = parseFloat(queryParams.minPrice);
      }
      if (queryParams.maxPrice) {
        filter.price.$lte = parseFloat(queryParams.maxPrice);
      }
    }

    if (queryParams.type && queryParams.type.trim()) {
      const types = Array.isArray(queryParams.type) ? queryParams.type : [queryParams.type.trim()];
      filter.type = { $in: types };
    }

    if (queryParams.state && queryParams.state.trim()) {
      filter.state = new RegExp(queryParams.state.trim(), 'i');
    }
      if (queryParams.city) {
        const cityValue = queryParams.city.trim();
        console.log(`Building city filter for: "${cityValue}"`);
        filter.city = new RegExp(cityValue, 'i');
        console.log(`City filter created:`, filter.city);
      }


    if (queryParams.minArea || queryParams.maxArea) {
      filter.areaSqFt = {};
      if (queryParams.minArea) {
        filter.areaSqFt.$gte = parseFloat(queryParams.minArea);
      }
      if (queryParams.maxArea) {
        filter.areaSqFt.$lte = parseFloat(queryParams.maxArea);
      }
    }

    if (queryParams.bedrooms) {
      const bedroomValue = queryParams.bedrooms.toString().trim();
      if (bedroomValue.includes('+')) {
        const minBedrooms = parseInt(bedroomValue.replace('+', ''));
        filter.bedrooms = { $gte: minBedrooms };
      } else {
        const exactBedrooms = parseInt(bedroomValue);
        if (!isNaN(exactBedrooms)) {
          filter.bedrooms = exactBedrooms;
        }
      }
    }

    if (queryParams.bathrooms) {
      const bathroomValue = queryParams.bathrooms.toString().trim();
      if (bathroomValue.includes('+')) {
        const minBathrooms = parseInt(bathroomValue.replace('+', ''));
        filter.bathrooms = { $gte: minBathrooms };
      } else {
        const exactBathrooms = parseInt(bathroomValue);
        if (!isNaN(exactBathrooms)) {
          filter.bathrooms = exactBathrooms;
        }
      }
    }

    if (queryParams.amenities) {
      const amenities = Array.isArray(queryParams.amenities) 
        ? queryParams.amenities 
        : queryParams.amenities.split(',').map(a => a.trim());
      filter.amenities = { $all: amenities };
    }

    if (queryParams.furnished && queryParams.furnished.trim()) {
      const furnishedOptions = Array.isArray(queryParams.furnished) 
        ? queryParams.furnished 
        : [queryParams.furnished.trim()];
      filter.furnished = { $in: furnishedOptions };
    }

    if (queryParams.availableFrom) {
      filter.availableFrom = { $lte: new Date(queryParams.availableFrom) };
    }

    if (queryParams.listedBy && queryParams.listedBy.trim()) {
      const listedByOptions = Array.isArray(queryParams.listedBy) 
        ? queryParams.listedBy 
        : [queryParams.listedBy.trim()];
      filter.listedBy = { $in: listedByOptions };
    }

    if (queryParams.tags) {
      const tags = Array.isArray(queryParams.tags) 
        ? queryParams.tags 
        : queryParams.tags.split(',').map(t => t.trim());
      filter.tags = { $in: tags };
    }

    if (queryParams.minRating) {
      filter.rating = { $gte: parseFloat(queryParams.minRating) };
    }

    if (queryParams.isVerified !== undefined) {
      if (queryParams.isVerified === 'true' || queryParams.isVerified === true) {
        filter.isVerified = true;
      } else if (queryParams.isVerified === 'false' || queryParams.isVerified === false) {
        filter.isVerified = false;
      }
    }

    if (queryParams.listingType && queryParams.listingType.trim()) {
      filter.listingType = queryParams.listingType.trim();
    }

    if (queryParams.createdBy) {
      filter.createdBy = queryParams.createdBy;
    }

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
        sortOptions.createdAt = -1; 
    }

    return sortOptions;
  }
}

module.exports = {
  buildPropertyFilter: FilterBuilder.buildPropertyFilter,
  buildSortOptions: FilterBuilder.buildSortOptions
};
