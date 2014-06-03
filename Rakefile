SITE_NAME = File.basename(Dir.pwd)
DEPLOY_PATH = ENV['SITE_DEPLOY_PATH']
SITE_ROOT = File.join(DEPLOY_PATH, SITE_NAME)

desc "Deploy working copy of site"
task :deploy do
  raise "No deploy path" unless DEPLOY_PATH
  system  "jekyll build -d #{SITE_ROOT}"
  rm File.join(SITE_ROOT, 'Rakefile')
end

