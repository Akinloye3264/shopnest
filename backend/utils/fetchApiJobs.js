/**
 * Fetch jobs from Adzuna API
 * @param {Object} options - Query parameters
 * @param {string} options.country - Country code (default: 'gb' for UK)
 * @param {string} options.search - Search query
 * @param {string} options.location - Location filter
 * @param {string} options.category - Category filter
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.resultsPerPage - Results per page (default: 20)
 * @returns {Promise<Object>} - API response with job listings
 */
async function fetchApiJobs({
  country = 'gb', // Changed from 'ng' to 'gb' (UK) since Adzuna doesn't support Nigeria
  search = '',
  location = '',
  category = '',
  page = 1,
  resultsPerPage = 20
} = {}) {
  const appId = process.env.ADZUNA_APP_ID;
  const apiKey = process.env.ADZUNA_API_KEY;
  
  if (!appId || !apiKey) {
    throw new Error('ADZUNA_APP_ID or ADZUNA_API_KEY environment variables are not set. Please add your Adzuna credentials to the .env file.');
  }

  try {
    // Build URL parameters for Adzuna API - use the exact format that works with curl
    const baseUrl = `https://api.adzuna.com/v1/api/jobs/${country}/search`;
    const params = new URLSearchParams();
    
    // Add required parameters
    params.append('app_id', appId);
    params.append('app_key', apiKey);
    params.append('results_per_page', resultsPerPage.toString());
    
    // Add optional parameters only if they have values
    if (search && search.trim()) {
      params.append('what', search.trim());
    }
    if (location && location.trim()) {
      params.append('where', location.trim());
    }
    if (page && page > 1) {
      params.append('page', page.toString());
    }

    const url = `${baseUrl}?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Adzuna API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    // Transform the API response to match our expected format
    const transformedData = {
      data: data.results || [],
      count: data.count || data.results?.length || 0,
      total: data.count || 0,
      page: parseInt(page),
      totalPages: Math.ceil((data.count || 0) / resultsPerPage),
      source: 'adzuna'
    };

    // Transform job listings to match our database schema
    transformedData.data = transformedData.data.map(job => ({
      id: job.id,
      title: job.title,
      description: job.description,
      category: job.category?.label || 'other',
      type: job.contract_type || 'full-time',
      location: job.location?.display_name || job.location?.area?.[0] || 'Remote',
      salary: job.salary_min ? (job.salary_max ? Math.round((job.salary_min + job.salary_max) / 2) : job.salary_min) : null,
      salaryType: job.salary_is_predicted ? 'estimated' : 'fixed',
      company: job.company?.display_name || 'Unknown Company',
      isRemote: job.location?.area?.[0]?.toLowerCase().includes('remote') || false,
      experienceLevel: 'any', // Adzuna doesn't provide experience level
      requiredSkills: [], // Extract from description if needed
      tags: job.category?.tag || [],
      applicationUrl: job.redirect_url,
      postedAt: job.created,
      deadline: null, // Adzuna doesn't provide deadline
      source: 'adzuna',
      externalId: job.id,
      externalUrl: job.redirect_url
    }));

    console.log(`Successfully fetched ${transformedData.data.length} jobs from Adzuna`);
    return transformedData;

  } catch (error) {
    console.error('Error fetching jobs from Adzuna:', error);
    
    if (error.message.includes('ADZUNA')) {
      throw error;
    }
    
    throw new Error(`Failed to fetch jobs from Adzuna: ${error.message}`);
  }
}

export default fetchApiJobs;
