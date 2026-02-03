/**
 * Fetch jobs from API Jobs API
 * @param {Object} options - Query parameters
 * @param {string} options.country - Country code (default: 'ng')
 * @param {string} options.search - Search query
 * @param {string} options.location - Location filter
 * @param {string} options.category - Category filter
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.resultsPerPage - Results per page (default: 20)
 * @returns {Promise<Object>} - API response with job listings
 */
async function fetchApiJobs({
  country = 'ng',
  search = '',
  location = '',
  category = '',
  page = 1,
  resultsPerPage = 20
} = {}) {
  const apiKey = process.env.API_JOBS;
  
  if (!apiKey) {
    throw new Error('API_JOBS environment variable is not set. Please add your API Jobs API key to the .env file.');
  }

  try {
    // Build request body
    const requestBody = {
      size: resultsPerPage
    };

    // Add optional parameters if provided
    if (search) requestBody.q = search;
    // Remove location for now as it seems to be invalid parameter
    // if (location) requestBody.location = location;
    if (category) requestBody.category = category;
    if (country) requestBody.country = country;
    if (page > 1) requestBody.page = page;

    const url = 'https://api.apijobs.dev/v1/job/search';
    
    console.log(`Fetching jobs from API Jobs: ${url}`, requestBody);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Jobs request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    // Transform the API response to match our expected format
    const transformedData = {
      data: data.data || data.jobs || [],
      count: data.count || data.data?.length || 0,
      total: data.total || data.total_jobs || 0,
      page: parseInt(data.page || page),
      totalPages: data.total_pages || Math.ceil((data.total || 0) / resultsPerPage),
      source: 'apijobs'
    };

    // Transform job listings to match our database schema
    transformedData.data = transformedData.data.map(job => ({
      id: job.id,
      title: job.title || job.job_title,
      description: job.description || job.job_description,
      category: job.category || job.job_category || 'other',
      type: job.type || job.job_type || 'full-time',
      location: job.location || job.job_location,
      salary: job.salary || null,
      salaryType: job.salary_type || 'fixed',
      company: job.company || job.company_name,
      isRemote: job.is_remote || job.remote || false,
      experienceLevel: job.experience_level || job.experience || 'any',
      requiredSkills: job.required_skills || job.skills || [],
      tags: job.tags || [],
      applicationUrl: job.application_url || job.apply_url,
      postedAt: job.posted_at || job.created_at || job.date_posted,
      deadline: job.deadline || job.application_deadline,
      source: 'apijobs',
      externalId: job.id
    }));

    console.log(`Successfully fetched ${transformedData.data.length} jobs from API Jobs`);
    return transformedData;

  } catch (error) {
    console.error('Error fetching jobs from API Jobs:', error);
    
    if (error.message.includes('API_JOBS_KEY')) {
      throw error;
    }
    
    throw new Error(`Failed to fetch jobs from API Jobs: ${error.message}`);
  }
}

export default fetchApiJobs;
